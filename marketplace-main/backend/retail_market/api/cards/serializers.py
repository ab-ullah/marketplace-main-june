from rest_framework import serializers
from api.cards.models import Card, Workflow
from api.constants.kyc_investor_types import KYCInvestorType
from api.eligibility_criteria.models import EligibilityCriteriaResponse
from api.funds.models import Fund
from slugify import slugify


class BulkCreateCardsListSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        cards = [Card(**item) for item in validated_data]
        return Card.objects.bulk_create(cards)


class CardSerializer(serializers.ModelSerializer):
    kyc_investor_type_name = serializers.SerializerMethodField()

    def validate(self, attrs):
        wf_qs = Workflow.objects.filter(company_id=self.context['company'].id)
        wf = wf_qs.filter(slug=self.context['wf_slug']).get()
        attrs['workflow'] = wf
        return super(CardSerializer, self).validate(attrs=attrs)

    @staticmethod
    def get_kyc_investor_type_name(obj: Card):
        if obj.kyc_investor_type:
            return KYCInvestorType(obj.kyc_investor_type).name
          
    def create(self, validated_data):
        card, _ = Card.objects.get_or_create(
            workflow=validated_data['workflow'],
            name=validated_data['name'],
            defaults=validated_data
        )
        return card
    class Meta:
        model = Card
        fields = ('card_id', 'order', 'name', 'schema', 'is_repeatable', 'card_dependencies',
                  'kyc_investor_type', 'kyc_investor_type_name')
        read_only_fields = ['workflow']
        list_serializer_class = BulkCreateCardsListSerializer


    def to_representation(self, instance):
        representation = super().to_representation(instance)
        fund = self.context.get('fund')
        if fund and fund.skip_net_worth_question:
            parsed_schema = []
            for question in representation.get('schema', []):
                if question.get('id') == 'net_worth':
                    continue
                parsed_schema.append(question)
            representation['schema'] = parsed_schema
        return representation


class WorkflowSerializer(serializers.ModelSerializer):
    cards = serializers.SerializerMethodField()
    slug = serializers.CharField(max_length=120, read_only=True)

    def get_cards(self, obj: Workflow):
        cards = obj.cards.all()
        return CardSerializer(
            cards,
            context={'fund': self.context['fund']},
            many=True
        ).data

    def validate(self, attrs):
        fund_qs = Fund.objects.filter(company_id=self.context['company'].id)
        fund = fund_qs.filter(external_id=self.context['fund_external_id']).get()
        attrs['fund'] = fund
        return super(WorkflowSerializer, self).validate(attrs=attrs)

    def create(self, validated_data):
        validated_data['company'] = self.context['company']
        validated_data['slug'] = slugify(validated_data['name'])
        workflow, _ = Workflow.objects.get_or_create(
            company=validated_data['company'],
            slug=validated_data['slug'],
            defaults=validated_data
        )
        return workflow

    class Meta:
        model = Workflow
        fields = ('name', 'type', 'cards', 'fund', 'slug', 'id')


class WorkflowLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = ('name', 'slug')
