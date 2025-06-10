from rest_framework import serializers
from django.db.models import F, Sum
from api.funds.models import Fund, FundInterest
from api.analytics.models import EntityAction, EntityStats
from datetime import date


class AnalyticsEntityActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntityAction
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},
            'company': {'read_only': True},
            'module': {'read_only': True}
        }

    def save(self):
        validated_data = self.validated_data
        company = self.get_company(validated_data['entity'], validated_data['entity_id'])
        module = self.get_module(validated_data['entity'])
        # using get_or_create and an explicit save instead of create_or_update because
        # update would not allow us to use a Field expression to increment the
        # view_count
        entity_action, created = EntityAction.objects.get_or_create(
            module=module,
            entity=validated_data['entity'],
            entity_id=validated_data['entity_id'],
            user_action=validated_data['user_action'],
            user=self.context['request'].user.associated_company_users.filter(company=company).first(),
            company_id=company.id,
        )

        entity_action.view_count = F("view_count") + 1
        entity_action.save(update_fields=["view_count"])

        return entity_action

    @staticmethod
    def get_module(entity_type):
        if entity_type == EntityAction.Entity.FUND:
            return EntityAction.Module.INVESTMENTS

        raise serializers.ValidationError("Invalid Entity Type")

    @staticmethod
    def get_company(entity_type, entity_id):
        if entity_type == EntityAction.Entity.FUND:
            fund = Fund.objects.get(id=entity_id)
            return fund.company

        raise serializers.ValidationError("Invalid Entity Type and Entity Id")


class AnalyticsFundInterestSerializer(serializers.ModelSerializer):
    visited_fund_page = serializers.SerializerMethodField()
    visited_interest_page = serializers.SerializerMethodField()
    submitted_interest_form = serializers.SerializerMethodField()
    indication_of_interest_start = serializers.SerializerMethodField()
    indication_of_interest_end = serializers.SerializerMethodField()
    total_equity_investment = serializers.SerializerMethodField()
    total_leverage_requested = serializers.SerializerMethodField()
    answer_details = serializers.SerializerMethodField()

    class Meta:
        model = Fund
        fields = ['total_equity_investment','total_leverage_requested','visited_fund_page',
                  'visited_interest_page', 'submitted_interest_form', 'indication_of_interest_start',
                  'indication_of_interest_end', 'answer_details']


    def get_visited_fund_page(self, obj: Fund):
        return EntityStats().count_visited_fund_page(obj)


    def get_visited_interest_page(self, obj: Fund):
        return EntityStats().count_visited_interest_page(obj)

    @staticmethod
    def get_submitted_interest_form(obj: Fund):
        return FundInterest.objects.filter(fund=obj).count()

    @staticmethod
    def get_indication_of_interest_start(obj: Fund):
        return date.today()

    @staticmethod
    def get_indication_of_interest_end(obj: Fund):
        return date.today()

    @staticmethod
    def get_total_equity_investment(obj: Fund):
        return FundInterest.objects.filter(fund=obj).aggregate(sum=Sum('equity_amount'))['sum']

    @staticmethod
    def get_total_leverage_requested(obj: Fund):
        return FundInterest.objects.filter(fund=obj).aggregate(sum=Sum('leverage_amount'))['sum']

    @staticmethod
    # Returns a sorted dictionary of questions and answers with the count for
    # each answer.
    def get_answer_details(obj: Fund):
        submissions = FundInterest.objects.all().filter(fund=obj)
        results_by_question = {}
        for submission in submissions:
            details = submission.interest_details
            for question, answer in details.items():
                if not isinstance(answer, dict):
                    continue

                answers = results_by_question.get(question, {})
                answer_value = answer['value']
                count = answers.get(answer_value, 0)
                answers[answer_value] = count + 1
                results_by_question[question] = answers

        return dict(sorted(results_by_question.items()))
