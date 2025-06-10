import logging
import mimetypes

import django.db.utils
from django.utils import timezone
from django.db.models import Q
from rest_enumfield import EnumField
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from slugify import slugify

from dateutil.parser import parse as dt_parse

from api.activities.models import FundActivity, LoanActivity, TransactionDetail
from api.activities.services.update_fund_investor import FundInvestorActivityService
from api.activities.utils.investment_code_parser import parse_activity_investment_code
from api.agreements.models import FundAgreementDocument
from api.companies.models import CompanyUser
from api.currencies.models import Currency, CurrencyRate
from api.documents.models import Document, FundDocument, InvestorDocument
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.funds.models import Fund, FundNav
from api.investors.models import Investor, CompanyUserInvestor
from api.partners.libs.file_name_parsing import parse_file_name
from api.partners.constants import FundTypeEnum, CurrencyEnum, VehicleTypeEnum, DocumentTypeEnum, \
    ContentTypeEnum, FundBusinessLineEnum
from api.partners.mappings.lasalle import BUSINESS_LINE_MAPPING, FUND_TYPE_MAPPING, VEHICLE_TYPE_MAPPING, \
    DOCUMENT_TYPE_MAPPING
from api.partners.services.create_notification import DocumentNotificationService
from api.partners.services.auth0_account_service import CreateAuth0Account
from api.users.models import RetailUser

CHAR_FIELD_MIN_LENGTH = 3

logger = logging.getLogger(__name__)


class PartnerFundSerializer(serializers.Serializer):
    id = serializers.CharField(required=True, max_length=250, min_length=CHAR_FIELD_MIN_LENGTH)
    investment_product_code = serializers.CharField(required=True, max_length=250, min_length=CHAR_FIELD_MIN_LENGTH)
    vehicle_code = serializers.CharField(required=False, max_length=250, default="")
    name = serializers.CharField(required=True, max_length=120, min_length=CHAR_FIELD_MIN_LENGTH)
    display_name = serializers.CharField(required=False, max_length=120, min_length=CHAR_FIELD_MIN_LENGTH)
    business_line = EnumField(choices=FundBusinessLineEnum)
    fund_type = EnumField(choices=FundTypeEnum)
    currency = EnumField(choices=CurrencyEnum)
    legacy_import = serializers.BooleanField(required=False, default=False)

    def to_internal_value(self, data):
        data['business_line'] = '_'.join(data.get('business_line', '').lower().strip().split())
        return super().to_internal_value(data)

    def validate(self, attrs):
        name = attrs['name']
        company = self.context['company']
        slug = slugify(name)

        raw_investment_code = attrs['investment_product_code']
        investment_code = raw_investment_code

        fund_query = Fund.objects.filter(company=company).filter(
            Q(partner_id=attrs['id']) |
            Q(investment_product_code=investment_code) |
            Q(slug=slug)
        )
        if fund_query.count() > 1:
            raise ValidationError('Please make sure that fund has a unique id, investment_product_code and name')

        if fund_query.count() == 1:
            fund = fund_query.first()
            if not (
                    fund.partner_id == attrs['id']
            ):
                raise ValidationError('Please make sure that fund has unique name, id and investment_product_code')

        return attrs

    def create(self, validated_data):
        company = self.context['company']
        currency = Currency.objects.get(company=company, code__iexact=validated_data['currency'].value)
        raw_investment_product_code = validated_data['investment_product_code']
        investment_product_code = raw_investment_product_code
        Fund.objects.update_or_create(
            partner_id=validated_data['id'],
            defaults={
                'raw_investment_product_code': validated_data['investment_product_code'],
                'name': validated_data['name'],
                'company': company,
                'business_line': BUSINESS_LINE_MAPPING[validated_data['business_line'].value],
                'fund_type': FUND_TYPE_MAPPING[validated_data['fund_type'].value.lower()],
                'fund_currency': currency,
                'slug': slugify(validated_data['name']),
                'investment_product_code': investment_product_code,
                'vehicle_code': validated_data['vehicle_code'],
                'is_legacy': validated_data['legacy_import'],
                'display_name': validated_data.get('display_name', None),
                'created_via_partner_api': True,
            })
        return validated_data


class CurrencySerializer(serializers.Serializer):
    transaction_date = serializers.DateTimeField(required=True)
    from_currency = EnumField(choices=CurrencyEnum)
    to_currency = EnumField(choices=CurrencyEnum)
    rate = serializers.FloatField(required=True)

    def create(self, validated_data):
        company = self.context['company']
        from_currency = Currency.objects.get(company=company, code__iexact=validated_data['from_currency'].value)
        to_currency = Currency.objects.get(company=company, code__iexact=validated_data['to_currency'].value)
        CurrencyRate.objects.create(
            from_currency=from_currency,
            to_currency=to_currency,
            conversion_rate=validated_data['rate'],
            rate_date=validated_data['transaction_date']
        )
        return validated_data


class FundActivitySerializers(serializers.ModelSerializer):
    class Meta:
        model = FundActivity
        exclude = ('created_at', 'modified_at')
        read_only_fields = ('company',)

    def validate(self, attrs):
        investor_account_code = attrs['investor_account_code']

        raw_investment_product_code = attrs['investment_product_code']
        investment_product_code = raw_investment_product_code

        company = self.context['company']
        if not Fund.objects.filter(investment_product_code=investment_product_code, company=company).exists():
            raise ValidationError('No fund found with code: {}'.format(investment_product_code))
        if not Investor.objects.filter(investor_account_code=investor_account_code).exists():
            raise ValidationError('No investor found with code: {}'.format(investor_account_code))
        return attrs

    def create(self, validated_data):
        company = self.context['company']
        validated_data['company'] = company

        raw_investment_product_code = validated_data['investment_product_code']
        validated_data['raw_investment_product_code'] = raw_investment_product_code
        validated_data['investment_product_code'] = raw_investment_product_code

        update_or_create_payload = dict(
            transaction_date=validated_data['transaction_date'],
            company=company,
            investment_product_code=validated_data['investment_product_code'],
            investor_account_code=validated_data['investor_account_code'], )
        if 'share_class' in validated_data:
            update_or_create_payload['share_class'] = validated_data['share_class']
        if 'investment_id' in validated_data:
            update_or_create_payload['investment_id'] = validated_data['investment_id']
        activity, _ = FundActivity.objects.update_or_create(
            **update_or_create_payload,
            defaults=validated_data
        )
        return activity


class LoanActivitySerializers(serializers.ModelSerializer):
    class Meta:
        model = LoanActivity
        exclude = ('created_at', 'modified_at')
        read_only_fields = ('company',)

    def validate(self, attrs):
        company = self.context['company']

        raw_investment_product_code = attrs['investment_product_code']
        investment_product_code = raw_investment_product_code

        investor_account_code = attrs['investor_account_code']
        if not Fund.objects.filter(investment_product_code=investment_product_code, company=company).exists():
            raise ValidationError('No fund found with code: {}'.format(investment_product_code))
        if not Investor.objects.filter(investor_account_code=investor_account_code).exists():
            raise ValidationError('No investor found with code: {}'.format(investor_account_code))
        return attrs

    def create(self, validated_data):
        company = self.context['company']
        validated_data['company'] = company

        raw_investment_product_code = validated_data['investment_product_code']
        validated_data['raw_investment_product_code'] = raw_investment_product_code
        validated_data['investment_product_code'] = raw_investment_product_code

        update_or_create_payload = dict(
            transaction_date=validated_data['transaction_date'],
            company=company,
            investment_product_code=validated_data['investment_product_code'],
            investor_account_code=validated_data['investor_account_code'], )
        if 'share_class' in validated_data:
            update_or_create_payload['share_class'] = validated_data['share_class']
        if 'investment_id' in validated_data:
            update_or_create_payload['investment_id'] = validated_data['investment_id']
        activity, _ = LoanActivity.objects.update_or_create(
            **update_or_create_payload,
            defaults=validated_data
        )
        return activity


class FundOnboardingDocumentSerializers(serializers.Serializer):
    id = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    fund_slug = serializers.CharField(required=True)
    file_name = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    file_type = EnumField(choices=DocumentTypeEnum)
    file_content_type = EnumField(choices=ContentTypeEnum)
    file_data = serializers.FileField(write_only=True, required=True, allow_empty_file=False)

    def validate(self, attrs):
        fund_slug = attrs['fund_slug']
        company = self.context['company']
        try:
            Fund.objects.get(slug__iexact=fund_slug, company=company)
        except Fund.DoesNotExist:
            raise ValidationError('No fund found with slug: {}'.format(fund_slug))

        return attrs

    def create(self, validated_data):
        company = self.context['company']
        fund = Fund.objects.get(slug__iexact=validated_data['fund_slug'], company=company)
        content_type = validated_data['file_content_type'].value
        file_type = validated_data['file_type'].value

        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data'],
            content_type=content_type
        )
        # TODO: scope the uniqueness to company and partner id for documents, not only partner-id
        document, created = Document.objects.update_or_create(
            partner_id=validated_data['id'],
            company=company,
            defaults={
                'partner_id': validated_data['id'],
                'company': company,
                'content_type': uploaded_document_info.content_type,
                'title': validated_data['file_name'],
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': DOCUMENT_TYPE_MAPPING[file_type],
                'file_date': timezone.now().date(),
                'access_scope': Document.AccessScopeOptions.COMPANY.value,
            }
        )

        if file_type == DocumentTypeEnum.FUND_AGREEMENT_DOCUMENT.value and created:
            FundAgreementDocument.objects.update_or_create(
                fund=fund,
                company=company,
                document=document
            )

        return validated_data


class FundDocumentSerializer(serializers.Serializer):
    id = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    fund_id = serializers.CharField(required=True)
    file_name = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    file_date = serializers.DateField(required=True)
    due_date = serializers.DateField(required=False)
    file_type = EnumField(choices=DocumentTypeEnum)
    file_content_type = serializers.CharField(required=True)
    skip_notification = serializers.BooleanField(default=False)
    file_data = serializers.FileField(write_only=True, required=True, allow_empty_file=False)
    is_admin_upload = serializers.BooleanField(default=False)

    def get_fund(self):
        fund_id = self.initial_data['fund_id']
        try:
            fund = Fund.objects.get(partner_id=fund_id, company=self.context['company'])
            return fund
        except Fund.DoesNotExist:
            raise ValidationError('No fund found with partner id: {}'.format(fund_id))

    def validate(self, attrs):
        file_content_type = attrs['file_content_type']

        fund = self.get_fund()
        if not fund.publish_investment_details and not attrs.get('skip_notification'):
            raise ValidationError('skip_notification must be true for unpublished funds')

        if attrs['file_type'].value == DocumentTypeEnum.CAPITAL_CALL.value:
            if not attrs.get('due_date'):
                raise ValidationError('Due date is required for capital call type document')

        valid_content_type = mimetypes.guess_extension(file_content_type)
        if valid_content_type is None:
            raise ValidationError('Unsupported file_content_type {} : A valid file_content_type is required'.format(
                file_content_type))
        document_qs = Document.objects.filter(partner_id=attrs['id'], company=self.context['company'])
        if document_qs.exists():
            document = document_qs.first()
            try:
                fund_document = document.document_fund
                if fund_document.fund != fund:
                    raise ValidationError(f'Document with id: {attrs["id"]} already assigned to another fund')
            except FundDocument.DoesNotExist:
                logger.info(f"No fund document for document {document.id}")
        return attrs

    def create(self, validated_data):
        company = self.context['company']
        content_type = validated_data['file_content_type']
        is_admin_upload = validated_data['is_admin_upload']
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data'],
            content_type=content_type
        )  # type: UploadedDocumentInfo

        fund = self.get_fund()

        document, created_document = Document.objects.update_or_create(
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
                'access_scope': Document.AccessScopeOptions.COMPANY
            }
        )

        FundDocument.objects.get_or_create(
            document=document,
            fund=fund,
            defaults={
                'require_acknowledgement': False
            }
        )

        skip_notification = validated_data.get('skip_notification')

        # Only create notifications when a document is created, not when it is updated.
        if created_document:
            notification_service = DocumentNotificationService(
                document=document,
                payload=validated_data,
                fund=fund,
                skip_notification=skip_notification,
                is_admin_upload=is_admin_upload
            )
            notification_service.process_fund()

        return validated_data


class InvestmentVehicleSerializer(serializers.Serializer):
    id = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    investor_account_code = serializers.CharField(required=True, max_length=250, min_length=CHAR_FIELD_MIN_LENGTH)
    name = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    vehicle_type = EnumField(choices=VehicleTypeEnum, required=False, allow_null=True, allow_blank=True)

    def validate(self, attrs):
        investors_query = Investor.objects.filter(
            Q(partner_id=attrs['id']) |
            Q(investor_account_code=attrs['investor_account_code'])
        )
        if investors_query.count() > 1:
            raise ValidationError('Please make sure that investor has unique id and investor_account_code')

        if investors_query.count() == 1:
            investor = investors_query.first()
            if investor.partner_id and not (
                    investor.partner_id == attrs['id']
            ):
                raise ValidationError(
                    'Please make sure that investment vehicle has unique id and investor_account_code'
                )
        return attrs


class InvestorSerializer(serializers.Serializer):
    id = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    preferred_user_name = serializers.EmailField(required=True)
    full_name = serializers.CharField(required=False)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    investment_vehicles = InvestmentVehicleSerializer(many=True, required=True)

    def validate(self, attrs):
        if not attrs.get('full_name') and not (attrs.get('first_name') and attrs.get('last_name')):
            raise ValidationError('Either Full Name or First and Last name should be provided')

        company = self.context['company']
        partner_id_by_investor_code = {}
        investor_code_by_partner_id = {}
        for vehicle in attrs.get('investment_vehicles', []):
            partner_id = vehicle['id']
            investor_code = vehicle['investor_account_code']
            if partner_id in investor_code_by_partner_id and investor_code_by_partner_id[partner_id] != investor_code:
                raise ValidationError(
                    'Please make sure that investment vehicle has unique id and investor_account_code'
                )
            if investor_code in partner_id_by_investor_code and partner_id_by_investor_code[
                investor_code] != partner_id:
                raise ValidationError(
                    'Please make sure that investment vehicle has unique id and investor_account_code'
                )
            partner_id_by_investor_code[investor_code] = partner_id
            investor_code_by_partner_id[partner_id] = investor_code

        email = attrs['preferred_user_name']
        try:
            user = RetailUser.objects.get(email__iexact=email)
        except RetailUser.DoesNotExist:
            user = None

        try:
            company_user = CompanyUser.objects.get(
                company=company,
                partner_id=attrs['id']
            )
        except CompanyUser.DoesNotExist:
            company_user = None

        if company_user and user and company_user.user_id != user.id:
            # Raise validation if the user is different from current companyUser's user
            # and belongs to a company user of same company
            if CompanyUser.objects.filter(
                    company=company,
                    user=user
            ).exists():
                raise ValidationError(
                    'Company User with this id exists and belongs to another user, and the provided email belongs to another company user in the same company'
                )

        return attrs

    @staticmethod
    def update_user(user: RetailUser, validated_data):
        user.email = validated_data['preferred_user_name']
        user.username = validated_data['preferred_user_name']
        updated_fields = ['email', 'username']

        if validated_data.get('first_name'):
            user.first_name = validated_data['first_name']
            updated_fields.append('first_name')

        if validated_data.get('last_name'):
            user.last_name = validated_data['last_name']
            updated_fields.append('last_name')

        if validated_data.get('full_name'):
            user.full_name = validated_data['full_name']
            updated_fields.append('full_name')

        user.save(update_fields=updated_fields)

    @staticmethod
    def create_user(validated_data):
        defaults = {
            'email': validated_data['preferred_user_name'],
            'username': validated_data['preferred_user_name'],
        }
        if validated_data.get('first_name'):
            defaults['first_name'] = validated_data['first_name']

        if validated_data.get('last_name'):
            defaults['last_name'] = validated_data['last_name']

        if validated_data.get('full_name'):
            defaults['full_name'] = validated_data['full_name']

        user, _ = RetailUser.objects.update_or_create(
            email__iexact=validated_data['preferred_user_name'],
            defaults=defaults
        )
        return user

    def create(self, validated_data):
        company = self.context['company']
        is_new_user_or_email_changed = False
        try:
            company_user = CompanyUser.objects.get(
                company=company,
                partner_id=validated_data['id']
            )
        except CompanyUser.DoesNotExist:
            company_user = None

        try:
            existing_user = RetailUser.objects.get(email__iexact=validated_data['preferred_user_name'])
        except RetailUser.DoesNotExist:
            existing_user = None

        # if a company user for this company exists then update them.
        if company_user:
            user = company_user.user
            different_user_email = user.email.lower() != validated_data['preferred_user_name'].lower()
            is_new_user_or_email_changed = different_user_email

            # Either we have the same email as of current user or the email is new and the new user does not exist
            # in either case we can update the current record
            if not different_user_email or not existing_user:
                self.update_user(user=user, validated_data=validated_data)
            else:
                # This case is where the user is different, so we need to associate him with this company
                # since we have checked in validation that this user is not associated with this company
                self.update_user(user=existing_user, validated_data=validated_data)
                company_user.user = existing_user
                company_user.save(update_fields=['user'])

        # Let's check to see if a user exists in this company but with a different
        # partner ID, maybe they were provisioned by logging in directly, before the API tried to create them
        # or the partner ID is changing.
        else:
            user = existing_user
            if user:
                try:
                    company_user = CompanyUser.objects.get(
                        user=user,
                        company=company
                    )
                except CompanyUser.DoesNotExist:
                    # No company user exists for this user we need to create one.
                    # We are trusting this partner to "claim" this user.
                    company_user, _ = CompanyUser.objects.get_or_create(
                        user=user,
                        company=company,
                        partner_id=validated_data['id']
                    )
                self.update_user(user=user, validated_data=validated_data)
            else:
                # No user exists, let's create them based on this data.
                user = self.create_user(validated_data=validated_data)
                # And link them to this company with the partner_id.
                company_user, _ = CompanyUser.objects.get_or_create(
                    user=user,
                    company=company,
                    partner_id=validated_data['id']
                )
                is_new_user_or_email_changed = True

        for investment_vehicle in validated_data.get('investment_vehicles', []):
            vehicle_type = investment_vehicle.get('vehicle_type')
            if vehicle_type:
                vehicle_type = VEHICLE_TYPE_MAPPING.get(vehicle_type.value)

            investor = None

            try:
                investor = Investor.objects.get(
                    investor_account_code=investment_vehicle['investor_account_code']
                )
            except Investor.DoesNotExist:
                pass

            if investor and investor.partner_id and investor.partner_id != investment_vehicle['id']:
                raise ValidationError('This id belongs to a different investor vehicle')

            try:
                if investor and not investor.partner_id:
                    investor.partner_id = investment_vehicle['id']
                    investor.name = investment_vehicle['name']
                    investor.vehicle_type = vehicle_type
                    investor.save()
                else:
                    investor, _ = Investor.objects.update_or_create(
                        partner_id=investment_vehicle['id'],
                        defaults={
                            'name': investment_vehicle['name'],
                            'investor_account_code': investment_vehicle['investor_account_code'],
                            'vehicle_type': vehicle_type
                        }
                    )
                CompanyUserInvestor.objects.get_or_create(
                    company_user=company_user,
                    investor=investor
                )
            except django.db.utils.IntegrityError:
                raise ValidationError('This id belongs to a different investor vehicle')

        if is_new_user_or_email_changed and len(company.sso_domains) > 0:
            sso_domains = [domain.lower() for domain in company.sso_domains]
            email_domain = user.email.split('@')[-1].lower()
            if email_domain not in sso_domains:
                CreateAuth0Account(
                    user=user,
                    company=company
                ).create_auth0_account()

        return validated_data


class InvestorDocumentSerializer(serializers.Serializer):
    id = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    investor_vehicle_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    fund_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    file_name = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    file_type = EnumField(choices=DocumentTypeEnum, required=False)
    file_date = serializers.DateField(required=False, allow_null=True)
    due_date = serializers.DateField(required=False)
    file_content_type = serializers.CharField(required=True)
    skip_notification = serializers.BooleanField(default=False)
    file_data = serializers.FileField(write_only=True)
    parse_file_name = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        company = self.context['company']
        if attrs.get('parse_file_name'):
            parsed_file_name = parse_file_name(attrs['file_name'])
            if not parsed_file_name:
                raise ValidationError('File name does not match the required format')
            try:
                file_type = DocumentTypeEnum(parsed_file_name['file_type'])
                parsed_file_name['file_type'] = file_type
                if file_type.value == DocumentTypeEnum.CAPITAL_CALL.value or file_type.value == DocumentTypeEnum.CAPITAL_CALLS.value:
                    due_date_str = parsed_file_name['due_date']
                    due_date = dt_parse(due_date_str)
                    attrs['due_date'] = due_date.date()

            except ValueError:
                raise ValidationError('Invalid value in file_type parsed from file_name')

            try:
                dt_parse(parsed_file_name['file_date'])
            except:
                raise ValidationError('Invalid value in file_date parsed from file_name')

            attrs.update(parsed_file_name)
        else:
            required_fields = ('fund_id', 'investor_vehicle_id', 'file_type', 'file_date')
            for field in required_fields:
                if not attrs.get(field):
                    raise ValidationError(f'{field} field is required')

        investor_vehicle_id = attrs['investor_vehicle_id']
        if not Investor.objects.filter(partner_id__iexact=investor_vehicle_id).exists():
            raise ValidationError('No investor found with id: {}'.format(investor_vehicle_id))

        fund_id = attrs.get('fund_id')
        if fund_id:
            try:
                fund = Fund.objects.get(partner_id__iexact=fund_id, company=company)
                if not fund.publish_investment_details and not attrs.get('skip_notification'):
                    raise ValidationError('skip_notification must be true for unpublished funds')

            except Fund.DoesNotExist:
                raise ValidationError('No fund found with id: {}'.format(fund_id))

        if attrs['file_type'].value == DocumentTypeEnum.CAPITAL_CALL.value:
            if not attrs.get('due_date'):
                raise ValidationError('Due date is required for capital call type document')
            if not fund_id:
                raise ValidationError('Fund is required for capital call type document')

        file_content_type = attrs.get('file_content_type')
        valid_content_type = mimetypes.guess_extension(file_content_type)
        if valid_content_type == None:
            raise ValidationError(
                'Unsupported file_content_type {} : A valid file_content_type is required'.format(file_content_type))

        return attrs

    def create(self, validated_data):
        company = self.context['company']
        content_type = validated_data['file_content_type']
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data'],
            content_type=content_type
        )  # type: UploadedDocumentInfo

        investor = Investor.objects.get(partner_id__iexact=validated_data['investor_vehicle_id'])
        fund = Fund.objects.get(partner_id__iexact=validated_data['fund_id'], company=company)

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
                skip_notification=skip_notification
            )
            notification_service.process_investor(investor=investor)
        return validated_data


class FundNavSerializer(serializers.ModelSerializer):
    fund_id = serializers.CharField(write_only=True)

    class Meta:
        model = FundNav
        fields = '__all__'
        read_only_fields = ('company', 'fund')

    def validate(self, attrs):
        fund_id = attrs['fund_id']
        company = self.context['company']
        if not Fund.objects.filter(partner_id__iexact=fund_id, company=company).exists():
            raise ValidationError('No fund found with id: {}'.format(fund_id))
        return attrs

    def create(self, validated_data):
        company = self.context['company']
        fund = Fund.objects.get(company=company, partner_id__iexact=validated_data.pop('fund_id'))
        fund_nav, _ = FundNav.objects.update_or_create(
            company=company,
            fund=fund,
            as_of=validated_data['as_of'],
            defaults={'nav': validated_data['nav']}
        )
        return fund_nav


class FundActivityRegenerationSerializers(serializers.Serializer):
    investor_account_code = serializers.CharField()
    investment_product_code = serializers.CharField()

    def validate(self, attrs):
        company = self.context['company']
        investor_account_code = attrs['investor_account_code']
        investment_product_code = attrs['investment_product_code']

        if not FundActivity.objects.filter(
                company=company,
                investor_account_code=investor_account_code,
                investment_product_code=investment_product_code
        ).exists():
            raise ValidationError('No fund activity found for account code/product code combination')

        if not LoanActivity.objects.filter(
                company=company,
                investor_account_code=investor_account_code,
                investment_product_code=investment_product_code
        ).exists():
            raise ValidationError('No loan activity found for account code/product code combination')

        return attrs

    def create(self, validated_data):
        company = self.context['company']
        investor_account_code = validated_data['investor_account_code']
        investment_product_code = validated_data['investment_product_code']

        latest_fund_activity = FundActivity.objects.filter(
            company=company,
            investor_account_code=investor_account_code,
            investment_product_code=investment_product_code
        ).latest('transaction_date')

        latest_loan_activity = LoanActivity.objects.filter(
            company=company,
            investor_account_code=investor_account_code,
            investment_product_code=investment_product_code
        ).latest('transaction_date')

        try:
            investment_service = FundInvestorActivityService(
                fund_activity=latest_fund_activity,
                loan_activity=latest_loan_activity
            )
            investment_service.update_values()
        except Exception as e:
            logger.error(e)
            raise e from e

        return validated_data


class TransactionDetailSerializers(serializers.Serializer):
    control_number = serializers.IntegerField(required=True)
    investor_account_code = serializers.CharField(required=True)
    investment_product_code = serializers.CharField(required=True)
    effective_date = serializers.DateField(required=True)
    transaction_type = serializers.IntegerField(required=True)
    actual_transaction_amount = serializers.DecimalField(required=True, max_digits=13, decimal_places=3)

    def validate(self, attrs):
        control_number = attrs['control_number']
        parsed_investment_product_code = parse_activity_investment_code(attrs['investment_product_code'])
        investment_product_code = parsed_investment_product_code['investment_code']
        attrs['parsed_investment_product_code'] = investment_product_code
        investor_account_code = attrs['investor_account_code']
        transaction_type = attrs['transaction_type']

        company = self.context['company']

        if not Fund.objects.filter(
                investment_product_code__iexact=investment_product_code, company=company).exists():
            raise ValidationError('No fund found with investment_product_code: {}'.format(investment_product_code))

        if not Investor.objects.filter(
                Q(investor_account_code=investor_account_code)
        ).exists():
            raise ValidationError('No investor with investor_account_code: {}'.format(investor_account_code))

        if control_number <= 0:
            raise ValidationError('A control number must be greater than 0')

        sidecar_type = TransactionDetail.TransactionDetailType.transaction_string_to_type(company, transaction_type)
        if sidecar_type == TransactionDetail.TransactionDetailType.UNKNOWN_TRANSACTION_TYPE:
            raise ValidationError("Unexpected transaction type: {}".format(transaction_type))

        return attrs

    def create(self, validated_data):
        company = self.context['company']
        investment_product_code = validated_data['parsed_investment_product_code']
        investor_account_code = validated_data['investor_account_code']

        fund = Fund.objects.filter(investment_product_code__iexact=investment_product_code, company=company).get()
        investor = Investor.objects.filter(Q(investor_account_code=investor_account_code)).get()
        transaction_type = TransactionDetail.TransactionDetailType.transaction_string_to_type(company, validated_data[
            'transaction_type'])

        TransactionDetail.objects.get_or_create(
            company=company,
            partner_id=self.get_partner_id(validated_data['control_number']),
            fund=fund,
            investor=investor,
            transaction_type=transaction_type.value,
            effective_date=validated_data['effective_date'],
            defaults={
                'investor': investor,
                'fund': fund,
                'effective_date': validated_data['effective_date'],
                'transaction_type': transaction_type.value,
                'transaction_status': TransactionDetail.TransactionDetailStatus.FINALIZED.value,
                'actual_transaction_amount': validated_data['actual_transaction_amount']
            }
        )
        return validated_data

    @staticmethod
    def get_partner_id(control_number):
        return "{}".format(control_number)


class PowerOfAttorneyDocumentSerializer(serializers.Serializer):
    id = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    file_name = serializers.CharField(required=True, min_length=CHAR_FIELD_MIN_LENGTH)
    file_data = serializers.FileField(write_only=True)
    file_content_type = EnumField(choices=ContentTypeEnum)
    file_date = serializers.DateField(required=False, allow_null=True)

    def create(self, validated_data):
        company = self.context['company']
        content_type = validated_data['file_content_type'].value
        uploaded_document_info = UploadDocumentService.upload(
            document_data=validated_data['file_data'],
            content_type=content_type
        )  # type: UploadedDocumentInfo

        document, _ = Document.objects.update_or_create(
            partner_id=validated_data['id'],
            company=company,
            defaults={
                'content_type': content_type,
                'title': validated_data['file_name'],
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': Document.DocumentType.POWER_OF_ATTORNEY_DOCUMENT.value,
                'access_scope': Document.AccessScopeOptions.COMPANY,
                'file_date': validated_data.get('file_date', timezone.now()),
            }
        )
        company.power_of_attorney_document = document
        company.save()
        return validated_data
