import uuid

from api.applications.utils import update_or_create_user_application
from api.companies.models import CompanyUser, CompanyFundVehicle
from api.eligibility_criteria.models import InvestmentAmount
from api.funds.models import Fund
from api.funds.services.invite_file_importers.riverside.constants import (EMAIL_FIELD, FIRST_NAME_FIELD,
                                                                          LAST_NAME_FIELD, VEHICLE,
                                                                          MAX_LEVERAGE_PERCENTAGE, INVESTING_ENTITY)
from api.funds.services.types import InviteRow
from api.transfers.services.create_transfer import CreateTransferService
from api.users.models import RetailUser


class RiverSideInviteUserToFund:
    def __init__(self, invite_row: InviteRow, fund: Fund):
        self.invite_row = self.cleanup_row(invite_row)
        self.user = self.get_user()
        self.company = fund.company
        self.fund = fund
        self.company_user = self.get_create_company_user()

    @staticmethod
    def cleanup_row(row):
        return {key: value.replace('%', '').strip() if (value and isinstance(value, str)) else None for key, value in row.items()}

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

    def get_create_company_user(self):
        company_user, _ = CompanyUser.objects.get_or_create(
            user=self.user,
            company=self.company,
            defaults={
                'partner_id': uuid.uuid4().hex,
            }
        )
        return company_user

    def create_investment_amount(self):
        investment_amount = InvestmentAmount.objects.create(
            max_leverage_percentage=self.invite_row.get(MAX_LEVERAGE_PERCENTAGE),
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

    def process(self):
        self.get_create_company_user()
        application = self.create_application()
        CreateTransferService(invite_row=self.invite_row, application=application).process()

    def create_application(self):
        invite_row = self.invite_row
        defaults_from_fund_file = {
            'first_name': invite_row.get(FIRST_NAME_FIELD),
            'last_name': invite_row.get(LAST_NAME_FIELD),
            INVESTING_ENTITY: invite_row.get(INVESTING_ENTITY)
        }
        vehicle = self.get_vehicle(invite_row.get(VEHICLE))
        values = {
            'investment_amount': self.create_investment_amount(),
            'defaults_from_fund_file': defaults_from_fund_file,
            VEHICLE: vehicle,
        }

        application, _ = update_or_create_user_application(user=self.user, fund=self.fund, values=values)

        return application
