from decimal import Decimal

import mimetypes

from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_enumfield import EnumField

from api.activities.services.update_fund_investor import FundInvestorActivityService
from api.capital_calls.models import CommitmentChoices
from api.capital_calls.serializers import BaseCapitalCallSerializer, BaseDistributionSerializer, \
    BaseCommitmentSerializer
from api.companies.serializers import CompanyUserSerializer
from api.currencies.services.currency_rate import CurrencyRateService
from api.currencies.services.fund_currency_info import FundCurrencyDetail
from api.applications.models import Application
from api.applications.utils import get_user_application
from api.funds.models import Fund, FundNav, FundTag
from api.investors.models import FundInvestor, FundOrder, Investor, RequestStatusChoice, FundSale, InvestorAdvisor
from api.investors.services.get_application_current_url import GetApplicationCurrentUrl
from api.investors.services.handle_order_completion import CompleteOrderService
from api.libs.utils.urls import get_eligibility_url
from api.documents.models import Document, InvestorDocument
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.libs.utils.user_name import get_full_name
from api.partners.serializers import FundDocumentSerializer
from api.partners.services.create_notification import DocumentNotificationService
from api.partners.constants import DocumentTypeEnum
from api.partners.mappings.lasalle import DOCUMENT_TYPE_MAPPING

CHAR_FIELD_MIN_LENGTH = 3


class InvestorSerializer(serializers.ModelSerializer):
    company_user = CompanyUserSerializer()

    class Meta:
        model = Investor
        exclude = ('created_at', 'modified_at')


class FundInvestorSerializer(serializers.ModelSerializer):
    investor_name = serializers.SerializerMethodField(read_only=True)
    fund_name = serializers.SerializerMethodField(read_only=True)
    fund_display_name = serializers.SerializerMethodField(read_only=True)
    is_legacy = serializers.SerializerMethodField(read_only=True)
    currency = serializers.SerializerMethodField(read_only=True)
    years_invested = serializers.SerializerMethodField(read_only=True)
    invested_since = serializers.SerializerMethodField(read_only=True)
    equity_remaining = serializers.SerializerMethodField(read_only=True)
    percent_of_account = serializers.SerializerMethodField(read_only=True)
    fund_nav = serializers.SerializerMethodField(read_only=True)
    loan_to_value = serializers.SerializerMethodField(read_only=True)
    has_data = serializers.SerializerMethodField(read_only=True)
    fair_market_value = serializers.FloatField(source='fund.fair_market_value', default=None)
    fair_market_value_date = serializers.DateField(source='fund.fair_market_value_date', default=None)
    initial_leverage_ratio = serializers.SerializerMethodField()
    current_leverage_ratio = serializers.SerializerMethodField()
    fund_ownership_percent = serializers.SerializerMethodField()
    net_commitment_called_to_date = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()
    is_nav_disabled = serializers.SerializerMethodField()
    offer_leverage = serializers.SerializerMethodField()
    commitments = serializers.SerializerMethodField()
    capital_calls = serializers.SerializerMethodField()
    total_commitment_calculated = serializers.SerializerMethodField()
    distributions = serializers.SerializerMethodField()
    loans_list = serializers.SerializerMethodField()

    company_currency = serializers.SerializerMethodField()
    investor_investment_currency = serializers.SerializerMethodField()
    investor_currency = serializers.SerializerMethodField()
    fund_currency = serializers.SerializerMethodField()

    class Meta:
        model = FundInvestor
        exclude = ('modified_at',)

    @staticmethod
    def get_company_logo(obj: FundInvestor):
        company = obj.fund.company
        if company.logo:
            return company.logo.url
        return None

    @staticmethod
    def get_total_commitment_calculated(obj: FundInvestor):
        total_commitment = 0
        for commitment in obj.investor_commitments.all():
            total_commitment += commitment.total_commitment
        return total_commitment

    @staticmethod
    def get_commitments(obj: FundInvestor):
        return BaseCommitmentSerializer(obj.investor_commitments.all(), many=True).data

    @staticmethod
    def get_capital_calls(obj: FundInvestor):
        return BaseCapitalCallSerializer(obj.investor_capital_calls.all(), many=True).data

    @staticmethod
    def get_loans_list(obj: FundInvestor):
        loans = []
        for capital_call in obj.investor_capital_calls.all():
            loans.append(
                {
                    'date': capital_call.due_date,
                    'type': 'Capital Call',
                    'number': capital_call.number,
                    'deal_name': capital_call.deal_name,
                    'capital_call_type': capital_call.capital_call_type,
                    'loan_called': capital_call.loan_called,
                }
            )

        for distribution in obj.investor_distributions.all():
            loans.append(
                {
                    'date': distribution.due_date,
                    'type': 'Distribution',
                    'number': distribution.number,
                    'deal_name': distribution.deal_name,
                    'due_for_gp_loan': distribution.due_for_gp_loan,
                }
            )
        loans = list(sorted(loans, key=lambda x: x['date'], reverse=True))
        return loans


    @staticmethod
    def get_distributions(obj: FundInvestor):
        data = [distribution for distribution in obj.investor_distributions.all()]
        return BaseDistributionSerializer(data, many=True).data

    @staticmethod
    def get_fund_ownership_percent(obj: FundInvestor) -> float:
        return obj.fund_ownership_percent * 100

    @staticmethod
    def get_initial_leverage_ratio(obj: FundInvestor) -> float:
        return obj.initial_leverage_ratio * 100

    @staticmethod
    def get_current_leverage_ratio(obj: FundInvestor) -> float:
        return obj.current_leverage_ratio * 100

    @staticmethod
    def get_investor_name(obj: FundInvestor) -> str:
        return obj.investor.name

    @staticmethod
    def get_fund_name(obj: FundInvestor) -> str:
        return obj.fund.name

    @staticmethod
    def get_fund_display_name(obj: FundInvestor) -> str:
        return obj.fund.display_name

    @staticmethod
    def get_is_legacy(obj: FundInvestor) -> bool:
        return obj.fund.is_legacy

    @staticmethod
    def get_currency(obj: FundInvestor) -> str:
        fund_detail = FundCurrencyDetail(fund=obj.fund)
        return fund_detail.process()

    @staticmethod
    def get_company_currency(obj: FundInvestor):
        return obj.get_currency_conversion_rate(
            source_currency=obj.fund.company.base_currency
        )

    @staticmethod
    def get_investor_investment_currency(obj: FundInvestor):
        return obj.get_currency_conversion_rate(
            source_currency=obj.currency
        )

    def get_investor_currency(self, obj: FundInvestor):
        user = self.context.get('user')
        if user:
            employment_record = user.employment_record()
            if employment_record and employment_record.currency:
                return obj.get_currency_conversion_rate(
                    source_currency=employment_record.currency
                )

        return obj.get_currency_conversion_rate(
            source_currency=obj.investor.get_investor_currency()
        )

    @staticmethod
    def get_fund_currency(obj: FundInvestor):
        return obj.get_currency_conversion_rate(
            source_currency=obj.fund.fund_currency
        )

    @staticmethod
    def get_years_invested(obj: FundInvestor) -> float:
        first_capital_call_date = FundInvestorActivityService.get_first_capital_call(fund_investor=obj)
        if not first_capital_call_date:
            return 0
        return (timezone.now().date() - first_capital_call_date).days / 365

    @staticmethod
    def get_invested_since(obj: FundInvestor) -> str:
        first_capital_call_date = FundInvestorActivityService.get_first_capital_call(fund_investor=obj)
        if not first_capital_call_date:
            return ''
        return str(first_capital_call_date)

    @staticmethod
    def get_equity_remaining(obj: FundInvestor) -> Decimal:
        return obj.equity_commitment - obj.equity_called

    @staticmethod
    def get_net_commitment_called_to_date(obj: FundInvestor) -> Decimal:
        return obj.called_to_date - obj.gross_distributions_recallable_to_date

    @staticmethod
    def get_percent_of_account(obj: FundInvestor) -> float:
        overall_net_equity = FundInvestor.objects.filter(investor=obj.investor).aggregate(
            total_equity=Sum('current_net_equity'))
        total_equity = overall_net_equity['total_equity']
        return 100 * obj.current_net_equity / total_equity if total_equity else 0

    @staticmethod
    def get_fund_nav(obj: FundInvestor):
        fund = obj.fund
        try:
            fund_nav = FundNav.objects.filter(fund=fund).latest('as_of')
            return fund_nav.nav
        except FundNav.DoesNotExist:
            return None

    @staticmethod
    # This is a percentage, so multiply the result by 100
    def get_loan_to_value(obj: FundInvestor):
        denominator = obj.gross_share_of_investment_product + obj.capital_calls_since_last_nav - obj.distributions_calls_since_last_nav
        if denominator:
            return (obj.loan_balance / denominator) * 100
        return 0

    @staticmethod
    def get_has_data(obj: FundInvestor):
        return FundNav.objects.filter(fund=obj.fund).exists()

    @staticmethod
    def get_is_nav_disabled(obj: FundInvestor):
        return obj.fund.is_nav_disabled

    @staticmethod
    def get_offer_leverage(obj: FundInvestor):
        return obj.fund.offer_leverage


class FundOrderSerializer(serializers.ModelSerializer):
    status_name = serializers.SerializerMethodField(read_only=True)
    ordered_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FundOrder
        exclude = ('created_at', 'modified_at')

    def update(self, instance, validated_data):
        updated_instance = super().update(instance, validated_data)
        if 'status' in validated_data and updated_instance.status == RequestStatusChoice.COMPLETED.value:
            complete_order_service = CompleteOrderService(order=instance)
            complete_order_service.complete()

        return updated_instance

    @staticmethod
    def get_status_name(obj: FundOrder) -> str:
        return obj.get_status_display()

    @staticmethod
    def get_ordered_by_name(obj: FundOrder) -> str:
        return obj.investor.name


class OpportunitySerializer(serializers.ModelSerializer):
    fund_investors = FundInvestorSerializer(many=True)
    fund_orders = FundOrderSerializer(many=True)
    fund_type_name = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()

    class Meta:
        model = Fund
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_fund_type_name(obj: Fund) -> str:
        return obj.get_fund_type_display()

    @staticmethod
    def get_currency(obj: Fund):
        fund_detail = FundCurrencyDetail(fund=obj)
        return fund_detail.process()


class FundTagSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(required=False)
    slug = serializers.CharField(required=False)

    class Meta:
        model = FundTag
        exclude = ('created_at', 'modified_at', 'company')

    def create(self, validated_data):
        if 'name' not in validated_data:
            raise serializers.ValidationError({'name': 'This field is required.'})

        if 'company' not in validated_data:
            validated_data['company'] = self.context['company']
        if 'slug' not in validated_data:
            validated_data['slug'] = validated_data['name'].lower().replace(' ', '-')

        return super().create(validated_data)


class NonInvestedOpportunitySerializer(serializers.ModelSerializer):
    tags = FundTagSerializer(many=True)
    currency = serializers.SerializerMethodField()
    application_link = serializers.SerializerMethodField()
    is_application_started = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()
    external_onboarding_url = serializers.URLField(source="external_onboarding.url", read_only=True)
    document_filter = serializers.CharField(source="document_filter.code", read_only=True)

    class Meta:
        model = Fund
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_company_logo(obj: Fund):
        company = obj.company
        if company.logo:
            return company.logo.url
        return None

    @staticmethod
    def get_currency(obj: Fund):
        fund_detail = FundCurrencyDetail(fund=obj)
        return fund_detail.process()

    def get_application_link(self, obj: Fund):
        user = self.context['view'].requested_user
        return GetApplicationCurrentUrl(
            fund=obj,
            user=user
        ).process()

    def get_is_application_started(self, obj: Fund):
        user = self.context['view'].requested_user
        try:
            application = get_user_application({
                'user_id': user.id,
                'fund__external_id': obj.external_id,
            })
            return True if application.eligibility_response else False
        except Application.DoesNotExist:
            return False


class FundSaleSerializer(serializers.ModelSerializer):
    fund_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FundSale
        exclude = ('created_at', 'modified_at')
        read_only_fields = ('sold_by',)

    def create(self, validated_data):
        validated_data['sold_by'] = self.context['user'].investor_profile
        return super().create(validated_data)

    @staticmethod
    def get_fund_name(obj: FundSale) -> str:
        return obj.fund.name


class RetrieveFundSerializer(serializers.ModelSerializer):
    fund_type_name = serializers.SerializerMethodField()

    class Meta:
        model = Fund
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_fund_type_name(obj: Fund) -> str:
        return obj.get_fund_type_display()


class RetrieveFundInvestorSerializer(serializers.ModelSerializer):
    ownership = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    fund = RetrieveFundSerializer()
    investor_name = serializers.CharField(source='investor.name', default=None)
    fund_name = serializers.SerializerMethodField()
    currency_code = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()
    initial_leverage_ratio = serializers.SerializerMethodField()
    current_leverage_ratio = serializers.SerializerMethodField()
    fund_ownership_percent = serializers.SerializerMethodField()
    fair_market_value = serializers.FloatField(source='fund.fair_market_value', default=None)
    fair_market_value_date = serializers.DateField(source='fund.fair_market_value_date', default=None)
    company_currency = serializers.SerializerMethodField()
    investor_investment_currency = serializers.SerializerMethodField()
    investor_currency = serializers.SerializerMethodField()
    fund_currency = serializers.SerializerMethodField()

    # TODO: These are temporary fields for riverside config, will be replaced once their data structure is confirmed
    total_commitment_calculated = serializers.SerializerMethodField()
    cash_commitment_calculated = serializers.SerializerMethodField()
    loan_commitment_calculated = serializers.SerializerMethodField()
    offset_commitment_calculated = serializers.SerializerMethodField()


    class Meta:
        model = FundInvestor
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_company_logo(obj: FundInvestor):
        company = obj.fund.company
        if company.logo:
            return company.logo.url
        return None



    @staticmethod
    def get_fund_ownership_percent(obj: FundInvestor) -> float:
        return obj.fund_ownership_percent * 100

    @staticmethod
    def get_initial_leverage_ratio(obj: FundInvestor) -> float:
        return obj.initial_leverage_ratio * 100

    @staticmethod
    def get_current_leverage_ratio(obj: FundInvestor) -> float:
        return obj.current_leverage_ratio * 100

    @staticmethod
    def get_ownership(obj: FundInvestor) -> str:
        return obj.fund.name

    @staticmethod
    def get_currency(obj: FundInvestor):
        currency = obj.currency
        if obj.fund.company.allow_multiple_currencies_in_portfolio():
            currency = obj.fund.fund_currency
        fund_detail = FundCurrencyDetail(fund=obj.fund, currency=currency)
        return fund_detail.process()

    @staticmethod
    def get_company_currency(obj: FundInvestor):
        return obj.get_currency_conversion_rate(
            source_currency=obj.fund.company.base_currency
        )

    @staticmethod
    def get_investor_investment_currency(obj: FundInvestor):
        return obj.get_currency_conversion_rate(
            source_currency=obj.currency
        )

    def get_investor_currency(self, obj: FundInvestor):
        user = self.context.get('user')
        if user:
            employment_record = user.employment_record()
            if employment_record and employment_record.currency:
                return obj.get_currency_conversion_rate(
                    source_currency=employment_record.currency
                )

        return obj.get_currency_conversion_rate(
            source_currency=obj.investor.get_investor_currency()
        )

    @staticmethod
    def get_fund_currency(obj: FundInvestor):
        return obj.get_currency_conversion_rate(
            source_currency=obj.fund.fund_currency
        )

    @staticmethod
    def get_currency_code(obj: FundInvestor):
        if obj.currency:
            return obj.currency.code

        if obj.fund.fund_currency:
            return obj.fund.fund_currency.code

    @staticmethod
    def get_fund_name(obj: FundInvestor):
        if obj.fund.display_name:
            return obj.fund.display_name
        return obj.fund.name

    @staticmethod
    def get_total_commitment_calculated(obj: FundInvestor):
        total_commitment = 0
        for commitment in obj.investor_commitments.all():
            total_commitment += commitment.total_commitment
        return total_commitment

    @staticmethod
    def get_cash_commitment_calculated(obj: FundInvestor):
        cash_commitment = 0
        for commitment in obj.investor_commitments.all():
            cash_commitment += commitment.cash_commitment
        return cash_commitment

    @staticmethod
    def get_loan_commitment_calculated(obj: FundInvestor):
        loan_commitment = 0
        for commitment in obj.investor_commitments.all():
            loan_commitment += commitment.loan_commitment
        return loan_commitment

    @staticmethod
    def get_offset_commitment_calculated(obj: FundInvestor):
        offset_commitment = 0
        for commitment in obj.investor_commitments.all():
            offset_commitment += commitment.offset_commitment
        return offset_commitment



class RetrieveFundOrderSerializer(serializers.ModelSerializer):
    ownership = serializers.SerializerMethodField()
    fund_slug = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    confirmation_date = serializers.DateField(source='fund.confirmation_date', default=None)
    currency = serializers.SerializerMethodField()
    investor_name = serializers.CharField(source='investor.name', default=None)

    class Meta:
        model = FundOrder
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_ownership(obj: FundOrder) -> str:
        return obj.fund.name

    @staticmethod
    def get_fund_slug(obj: FundOrder) -> str:
        return obj.fund.slug

    @staticmethod
    def get_can_edit(obj: FundOrder) -> bool:
        if obj.status != RequestStatusChoice.PENDING.value:
            return False

        if obj.fund.confirmation_date and obj.fund.confirmation_date < timezone.now().date():
            return False

        return True

    @staticmethod
    def get_currency(obj: FundOrder):
        fund_detail = FundCurrencyDetail(fund=obj.fund)
        return fund_detail.process()


class InvestorDetailSerializer(serializers.ModelSerializer):
    invested_funds = RetrieveFundInvestorSerializer(many=True)
    invested_orders = RetrieveFundOrderSerializer(many=True)
    investor_sales = FundSaleSerializer(many=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['invested_funds'].context.update(self.context)

    class Meta:
        model = Investor
        exclude = ('modified_at',)


class InvestorProfileBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investor
        exclude = ('modified_at',)


class ActiveApplicationsFundSerializer(serializers.ModelSerializer):
    application_link = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    continue_url = serializers.SerializerMethodField()

    class Meta:
        model = Fund
        fields = (
            'name',
            'external_id',
            'focus_region',
            'application_link',
            'type',
            'risk_profile',
            'application_status',
            'continue_url'
        )

    def get_application_link(self, obj: Fund):
        user = self.context['requested_user']
        return GetApplicationCurrentUrl(
            fund=obj,
            user=user
        ).process()

    def get_application_status(self, obj: Fund):
        fund_status = self.context['fund_status']
        return fund_status.get(obj.external_id, 'continue')

    def get_continue_url(self, obj: Fund):
        continue_url = self.context['continue_url']
        return continue_url.get(obj.external_id, get_eligibility_url(obj.external_id))


class InvestorDocumentSerializer(serializers.Serializer):
    id = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    investor_vehicle_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    fund_external_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    file_name = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    file_type = EnumField(choices=DocumentTypeEnum, required=False)
    file_date = serializers.DateField(required=False, allow_null=True)
    due_date = serializers.DateField(required=False)
    file_content_type = serializers.CharField(required=True)
    file_data = serializers.FileField(write_only=True)
    skip_notification = serializers.BooleanField(default=False)
    parse_file_name = serializers.BooleanField(required=False, default=False)
    is_admin_upload = serializers.BooleanField(default=False)

    def validate(self, attrs):
        company = self.context['company']

        investor_vehicle_id = attrs['investor_vehicle_id']
        if not Investor.objects.filter(partner_id__iexact=investor_vehicle_id).exists():
            raise ValidationError('No investor found with id: {}'.format(investor_vehicle_id))

        fund_external_id = attrs.get('fund_external_id')
        if fund_external_id:
            try:
                fund = Fund.objects.get(external_id__iexact=fund_external_id, company=company)
                if not fund.publish_investment_details and not attrs.get('skip_notification'):
                    raise ValidationError('skip_notification must be true for unpublished funds')
            except Fund.DoesNotExist:
                raise ValidationError('No fund found with external id: {}'.format(fund_external_id))

        file_content_type = attrs.get('file_content_type')
        valid_content_type = mimetypes.guess_extension(file_content_type)
        if attrs['file_type'].value == DocumentTypeEnum.CAPITAL_CALL.value:
            if not attrs.get('due_date'):
                raise ValidationError('Due date is required for capital call type document')
        if valid_content_type is None:
            raise ValidationError(
                'Unsupported file_content_type {} : A valid file_content_type is required'.format(file_content_type))

        return attrs

    def create(self, validated_data):
        company = self.context['company']
        content_type = validated_data['file_content_type']
        is_admin_upload = validated_data['is_admin_upload']
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data'],
            content_type=content_type
        )  # type: UploadedDocumentInfo

        investor = Investor.objects.get(partner_id__iexact=validated_data['investor_vehicle_id'])
        fund = None
        if 'fund_external_id' in validated_data:
            fund = Fund.objects.get(external_id__iexact=validated_data['fund_external_id'], company=company)

        document, document_created = Document.objects.update_or_create(
            partner_id=validated_data['id'],
            company=company,
            defaults={
                'content_type': content_type,
                'title': validated_data['file_name'],
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': DOCUMENT_TYPE_MAPPING[validated_data['file_type'].value],
                'file_date': validated_data['file_date'],
                'access_scope': Document.AccessScopeOptions.INVESTOR_ONLY,
            }
        )

        InvestorDocument.objects.get_or_create(
            document=document,
            investor=investor,
            fund=fund
        )
        skip_notification = validated_data.get('skip_notification')

        if document_created:
            notification_service = DocumentNotificationService(
                document=document,
                payload=validated_data,
                fund=fund,
                investor=investor,
                skip_notification=skip_notification,
                is_admin_upload=is_admin_upload
            )
            notification_service.process_investor(investor=investor)
        return validated_data


class InvestorUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investor
        exclude = ('created_at', 'modified_at')


class CompanyFundDocumentCreateSerializer(FundDocumentSerializer):
    fund_id = serializers.CharField(required=False)
    fund_external_id = serializers.CharField(required=True)

    def get_fund(self):
        fund_external_id = self.initial_data['fund_external_id']
        try:
            fund = Fund.objects.get(external_id=fund_external_id, company=self.context['company'])
            return fund
        except Fund.DoesNotExist:
            raise ValidationError('No fund found with external id: {}'.format(fund_external_id))


class InvestorAdvisorListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='investor.user.email', default=None)
    display_name = serializers.SerializerMethodField(read_only=True)
    user_id = serializers.EmailField(source='investor.id', default=None)

    class Meta:
        model = InvestorAdvisor
        fields = ('email', 'display_name', 'user_id','advisor')

    @staticmethod
    def get_display_name(obj: InvestorAdvisor) -> str:
        user = obj.investor.user
        full_name = get_full_name(user)
        if full_name:
            return f'{full_name} - {user.email}'
        return user.email
