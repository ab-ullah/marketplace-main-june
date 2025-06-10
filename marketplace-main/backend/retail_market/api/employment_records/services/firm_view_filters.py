from api.companies.models import Company
from api.employment_records.models import JobBand, Department, OfficeLocation, CompanyRole, CostCenter, BusinessUnit, \
    Position


class FirmViewFilters:
    def __init__(self, company):
        self.company = company

    def format_filter(self, filter):
        return {
            "label": filter['name'],
            "value": filter['id']
        }

    def get_job_bands(self):
        job_bands = JobBand.objects.filter(company=self.company).values('name', 'id')
        return list(map(self.format_filter, job_bands))

    def get_departments(self):
        departments = Department.objects.filter(company=self.company).values('name', 'id')
        return list(map(self.format_filter, departments))

    def get_office_locations(self):
        office_location = OfficeLocation.objects.filter(company=self.company).values('name', 'id')
        return list(map(self.format_filter, office_location))

    def get_company_roles(self):
        company_roles = CompanyRole.objects.filter(company=self.company).values('name', 'id')
        return list(map(self.format_filter, company_roles))

    def get_cost_centers(self):
        cost_centers = CostCenter.objects.filter(company=self.company).values('name', 'id')
        return list(map(self.format_filter, cost_centers))

    def get_business_units(self):
        business_units = BusinessUnit.objects.filter(company=self.company).values('name', 'id')
        return list(map(self.format_filter, business_units))

    def get_titles(self):
        positions = Position.objects.filter(
            company=self.company,
            end_date=None
        ).exclude(
            title__isnull=True
        ).exclude(
            title=None
        ).order_by('title').distinct('title').values('title')
        filters = []
        for position in positions:
            filters.append({
                'label': position['title'],
                'value': position['title']
            })
        return filters

    def get_filters(self):
        formatted_filters = []
        if not hasattr(self.company, 'firm_view_filter'):
            return formatted_filters

        company_filters = self.company.firm_view_filter
        for param in company_filters.filters:
            name = param['name']
            options = []
            if name == 'job_bands':
                options = self.get_job_bands()
            elif name == 'departments':
                options = self.get_departments()
            elif name == 'office_locations':
                options = self.get_office_locations()
            elif name == 'company_roles':
                options = self.get_company_roles()
            elif name == 'cost_centers':
                options = self.get_cost_centers()
            elif name == 'business_units':
                options = self.get_business_units()
            elif name == 'titles':
                options = self.get_titles()

            if options:
                formatted_filters.append(
                    {
                        **param,
                        'options': options
                    }
                )
        return formatted_filters
