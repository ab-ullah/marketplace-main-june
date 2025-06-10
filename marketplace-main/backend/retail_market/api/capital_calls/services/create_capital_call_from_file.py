from django.utils import timezone

from api.admin_users.models import AdminUser
from api.capital_calls.constants import CAPITAL_CALL_FILE_MAPPINGS
from api.capital_calls.models import FundCapitalCall
from api.documents.models import Document
from api.funds.models import Fund
from api.funds.utils.convert_curreny_to_number import \
    convert_currency_to_number
from api.libs.utils.BaseFileProcessingService import BaseFileProcessingService
from api.users.models import RetailUser


class ProcessCapitalCallFile(BaseFileProcessingService):
    def __init__(self, in_memory_file, due_date, fund: Fund, admin_user: AdminUser):
        self.due_date = due_date
        self.admin_user = admin_user
        super().__init__(
            in_memory_file=in_memory_file,
            fund=fund,
            document_type=Document.DocumentType.BULK_CAPITAL_CALL.value,
            access_scope=Document.AccessScopeOptions.COMPANY.value,
        )

    @staticmethod
    def map_file_row(row):
        parsed_row = {}
        for k, v in row.items():
            if mapped_key := CAPITAL_CALL_FILE_MAPPINGS.get(k.strip()):
                parsed_row[mapped_key] = v

        return parsed_row

    @staticmethod
    def clean_data(row):
        fields = ['amount', 'investment', 'management_fees', 'organization_cost', 'fund_expenses', 'total_to_date',
                  'fulfilled_from_loan', 'investor_obligation', 'partner_commitment', 'previously_contributed',
                  'total_amount_due', 'unpaid_commitment']
        for field in fields:
            if field in row:
                row[field] = convert_currency_to_number(row[field])

    def process_row(self, row):
        from api.capital_calls.serializers import \
            CapitalCallDetailCreateSerializer

        mapped_row = self.map_file_row(row=row)
        self.clean_data(mapped_row)
        mapped_row['capital_call'] = self.object.id
        user = self.get_user(mapped_row.get('email'))
        if user:
            mapped_row['user'] = user.id
            serializer = CapitalCallDetailCreateSerializer(data=mapped_row)
            if serializer.is_valid(raise_exception=False):
                serializer.save()
            else:
                self.errors.append(serializer.errors)

    def get_user(self, email):
        try:
            return RetailUser.objects.get(email__iexact=email)
        except RetailUser.DoesNotExist:
            self.errors.append(f'User {email} does not exists')
            return None

    def create_document_relation(self, document: Document):
        self.object = FundCapitalCall.objects.create(
            fund=self.fund,
            company=self.fund.company,
            due_date=self.due_date,
            created_timestamp=timezone.now().date(),
            document=document
        )
