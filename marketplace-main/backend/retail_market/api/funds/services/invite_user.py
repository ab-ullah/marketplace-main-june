import re
import uuid
from rest_framework.generics import get_object_or_404

from django.db.models import Q

from api.applications.models import Application
from api.applications.utils import update_or_create_user_application
from api.companies.models import CompanyUser, CompanyFundVehicle
from api.eligibility_criteria.models import InvestmentAmount
from api.funds.constants import (EMAIL_FIELD, FIRST_NAME_FIELD, LAST_NAME_FIELD, DEPARTMENT_FIELD, JOB_BAND_FIELD,
                                 MAX_LEVERAGE_FIELD, OFFICE_LOCATION_FIELD, REGION_FIELD, LEVERAGE, EQUITY_AMOUNT,
                                 RESTRICTED_TIME_PERIOD_FIELD, RESTRICTED_GEOGRAPHIC_AREA_FIELD, FINAL_AMOUNT_FIELDS,
                                 APPLICATION_CUSTOM_FIELD_MAPPING, VEHICLE, SHARE_CLASS, INVESTOR_ACCOUNT_CODE,
                                 LEVERAGE_OPTION_DESCRIPTION, MAX_LEVERED_COMMITMENT_AMOUNT)
from api.funds.models import Fund, FundShareClass
from api.funds.services.types import InviteRow
from api.funds.utils.convert_curreny_to_number import convert_currency_to_number
from api.geographics.models import Country
from api.investors.models import Investor
from api.investors.services.validate_investor_user_relation import ValidateUserInvestorRelationService
from api.kyc_records.models import KYCRecord, KYCInvestorType
from api.libs.utils.user_name import get_display_name
from api.transfers.services.create_transfer import CreateTransferService
from api.users.models import RetailUser
from api.transfers.constants import LOAN_DATE

LEVERAGE_RATIO_REGEX = re.compile(r'^(\d+):\d+$')


class InviteUserToFund:
    def __init__(self, invite_row: InviteRow, fund: Fund):
        self.invite_row = InviteUserToFund.cleanup_row(invite_row)
        self.user = self.get_user()
        self.company = fund.company
        self.fund = fund
        self.company_user = self.get_create_company_user()

    @staticmethod
    def cleanup_row(row):
        return {key: value.strip() for key, value in row.items()}

    def get_user(self):
        invite_row = self.invite_row
        email = self.invite_row[EMAIL_FIELD]
        try:
            return RetailUser.objects.get(email__iexact=email)
        except RetailUser.DoesNotExist:
            return RetailUser.objects.create(
                email=email,
                first_name=invite_row.get(FIRST_NAME_FIELD),
                last_name=invite_row.get(LAST_NAME_FIELD),
                is_active=False,
                username=f'temp|{uuid.uuid4().hex}',
                is_invited=True
            )

    def get_country(self):
        country_code_or_name = self.invite_row.get(OFFICE_LOCATION_FIELD)
        return Country.objects.filter(
            Q(iso_code__iexact=country_code_or_name) | Q(name__iexact=country_code_or_name)).first()

    def get_create_company_user(self):
        country = self.get_country()

        company_user, _ = CompanyUser.objects.get_or_create(
            user=self.user,
            company=self.company,
            defaults={
                'partner_id': uuid.uuid4().hex,
                'region': self.invite_row.get(REGION_FIELD),
                'office_location': country,
                'department': self.invite_row.get(DEPARTMENT_FIELD),
                'job_band': self.invite_row.get(JOB_BAND_FIELD),
            }
        )
        return company_user

    def is_application_transferred(self):
        return True if self.invite_row.get(LOAN_DATE) else False

    def get_max_leverage_ratio(self):
        leverage_ratio = self.invite_row.get(MAX_LEVERAGE_FIELD)
        if not leverage_ratio:
            return None

        regex_match = LEVERAGE_RATIO_REGEX.search(leverage_ratio)
        if regex_match and regex_match.groups():
            return int(regex_match.groups()[0])

    def get_leverage_ratio(self):
        leverage_ratio = self.invite_row.get(LEVERAGE)
        if not leverage_ratio:
            return 0

        regex_match = LEVERAGE_RATIO_REGEX.search(leverage_ratio)
        if regex_match and regex_match.groups():
            return int(regex_match.groups()[0])

    def get_equity_amount(self):
        amount = convert_currency_to_number(self.invite_row.get(EQUITY_AMOUNT))
        if amount and amount >= self.fund.minimum_investment:
            return amount
        return 0

    def get_final_amounts(self):
        final_amount_data = {}
        custom_field_data = {}
        for amount_field in FINAL_AMOUNT_FIELDS:
            amount_value = self.invite_row.get(amount_field)

            if amount_value:
                custom_field_data[APPLICATION_CUSTOM_FIELD_MAPPING[amount_field]] = True
                final_amount_data[amount_field] = convert_currency_to_number(amount_value)

        return {
            'custom_amounts': custom_field_data,
            'final_amount_data': final_amount_data
        }

    def get_max_levered_amount(self):
        max_levered_amount = self.invite_row.get(MAX_LEVERED_COMMITMENT_AMOUNT)
        if max_levered_amount:
            amount = convert_currency_to_number(max_levered_amount)
            return amount

        return None

    def create_investment_amount(self, final_amount_data, leverage_option_description):
        investment_amount = InvestmentAmount.objects.create(
            amount=self.get_equity_amount(),
            leverage_ratio=self.get_leverage_ratio(),
            leverage_option_description=leverage_option_description,
            max_levered_commitment_amount=self.get_max_levered_amount(),
            **final_amount_data
        )
        return investment_amount

    def get_vehicle(self, vehicle_name):
        if not vehicle_name:
            return None
        try:
            return CompanyFundVehicle.objects.get(
                name__iexact=vehicle_name,
                company=self.company
            )
        except CompanyFundVehicle.DoesNotExist:
            return None

    def get_share_class(self, share_class_name, vehicle):
        if not share_class_name or not vehicle:
            return None
        try:
            return FundShareClass.objects.get(
                display_name__iexact=share_class_name,
                company_fund_vehicle=vehicle,
                fund=self.fund
            )
        except FundShareClass.DoesNotExist:
            return None

    def create_or_update_investor(self, investor_code):
        if not investor_code:
            return None

        investor, created = Investor.objects.get_or_create(
            investor_account_code=investor_code,
            defaults={
                'investor_account_code': investor_code,
                'name': get_display_name(user=self.user)
            }
        )
        if not created:
            ValidateUserInvestorRelationService(
                email=self.user.email,
                investor=investor
            ).validate()
        return investor

    def process(self):
        self.get_create_company_user()
        application = self.create_application()
        CreateTransferService(invite_row=self.invite_row, application=application).process()

    def create_application(self):
        invite_row = self.invite_row
        country = self.get_country()
        defaults_from_fund_file = {
            'first_name': invite_row.get(FIRST_NAME_FIELD),
            'last_name': invite_row.get(LAST_NAME_FIELD),
            'department': invite_row.get(DEPARTMENT_FIELD),
            'job_band': invite_row.get(JOB_BAND_FIELD),
            'office_location': country.id if country else None
        }
        final_allocation_info = self.get_final_amounts()
        vehicle = self.get_vehicle(invite_row.get(VEHICLE))
        share_class = self.get_share_class(invite_row.get(SHARE_CLASS), vehicle)
        investor = self.create_or_update_investor(invite_row.get(INVESTOR_ACCOUNT_CODE))

        if self.is_application_transferred():
            return Application.objects.create(
                user=self.user,
                company=self.company,
                fund=self.fund,
                max_leverage_ratio=self.get_max_leverage_ratio(),
                **final_allocation_info['custom_amounts'],
                investment_amount=self.create_investment_amount(
                    final_amount_data=final_allocation_info['final_amount_data'],
                    leverage_option_description=invite_row.get(LEVERAGE_OPTION_DESCRIPTION, "")
                ),
                defaults_from_fund_file=defaults_from_fund_file,
                region=invite_row.get(REGION_FIELD),
                restricted_time_period=invite_row.get(RESTRICTED_TIME_PERIOD_FIELD),
                restricted_geographic_area=invite_row.get(RESTRICTED_GEOGRAPHIC_AREA_FIELD),
                vehicle=vehicle,
                share_class=share_class,
                investor=investor,
                is_transferred=True
            )
        else:
            values = {
                'max_leverage_ratio': self.get_max_leverage_ratio(),
                **final_allocation_info['custom_amounts'],
                'investment_amount': self.create_investment_amount(
                    final_amount_data=final_allocation_info['final_amount_data'],
                    leverage_option_description=invite_row.get(LEVERAGE_OPTION_DESCRIPTION, "")
                ),
                'defaults_from_fund_file': defaults_from_fund_file,
                'region': invite_row.get(REGION_FIELD),
                RESTRICTED_TIME_PERIOD_FIELD: invite_row.get(RESTRICTED_TIME_PERIOD_FIELD),
                RESTRICTED_GEOGRAPHIC_AREA_FIELD: invite_row.get(RESTRICTED_GEOGRAPHIC_AREA_FIELD),
                VEHICLE: vehicle,
                SHARE_CLASS: share_class,
                'investor': investor
            }

            application, _ = update_or_create_user_application(user=self.user, fund=self.fund, values=values)

            return application
