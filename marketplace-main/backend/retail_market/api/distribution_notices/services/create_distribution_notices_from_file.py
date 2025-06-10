from django.utils import timezone

from api.admin_users.models import AdminUser
from api.distribution_notices.constants import \
    DISTRIBUTION_NOTICE_FILE_MAPPINGS
from api.distribution_notices.models import DistributionNotice
from api.documents.models import Document
from api.funds.models import Fund
from api.funds.utils.convert_curreny_to_number import \
    convert_currency_to_number
from api.libs.utils.BaseFileProcessingService import BaseFileProcessingService
from api.users.models import RetailUser


class ProcessDistributionNoticeFile(BaseFileProcessingService):
    def __init__(self, in_memory_file, distribution_date, fund: Fund, admin_user: AdminUser):
        self.admin_user = admin_user
        self.distribution_date = distribution_date
        super().__init__(
            in_memory_file=in_memory_file,
            fund=fund,
            document_type=Document.DocumentType.BULK_DISTRIBUTION.value,
            access_scope=Document.AccessScopeOptions.COMPANY.value,
        )

    @staticmethod
    def map_file_row(row):
        parsed_row = {}
        for k, v in row.items():
            if mapped_key := DISTRIBUTION_NOTICE_FILE_MAPPINGS.get(k.strip()):
                parsed_row[mapped_key] = v

        return parsed_row

    @staticmethod
    def clean_data(row):
        fields = ['amount', 'investments', 'management_fees', 'organization_cost', 'fund_expenses', 'total_to_date',
                  'partner_commitment', 'previously_contributed', 'interest', 'unpaid_commitment', 'ownership',
                  'total_amount_due']
        for field in fields:
            if field in row:
                row[field] = convert_currency_to_number(row[field])

    def process_row(self, row):
        from api.distribution_notices.serializers import \
            DistributionNoticeDetailCreateSerializer

        mapped_row = self.map_file_row(row=row)
        self.clean_data(mapped_row)
        mapped_row['distribution_notice'] = self.object.id
        user = self.get_user(mapped_row.get('email'))
        if user:
            mapped_row['user'] = user.id
            serializer = DistributionNoticeDetailCreateSerializer(data=mapped_row)
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
        self.object = DistributionNotice.objects.create(
            fund=self.fund,
            company=self.fund.company,
            created_timestamp=timezone.now().date(),
            document=document,
            distribution_date=self.distribution_date
        )
