from api.companies.models import Company
from api.page_configs.models import PageConfig
from api.page_configs.serializers import PageConfigSerializer
from api.page_configs.views import PAGE_CONFIG_MAPPING


class CompanyPageConfigRetrieval:
    def __init__(self, company: Company, page_type):
        self.company = company
        self.page_type = page_type

    def get_from_db(self):
        queryset = PageConfig.objects.filter(
            company=self.company,
            enabled=True,
            page=self.page_type
        )
        count = queryset.count()
        if count != 1:
            return None

        return queryset.get()

    def get_config(self):
        db_config = self.get_from_db()
        if db_config:
            return PageConfigSerializer(db_config).data['page_value']

        return PAGE_CONFIG_MAPPING[self.page_type]
