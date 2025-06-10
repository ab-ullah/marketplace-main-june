from django.utils.deprecation import MiddlewareMixin

from api.companies.services.company_service import CompanyService


class CompanyTokenMiddleware(MiddlewareMixin):
    def process_request(self, request):
        company = CompanyService.get_company_from_request(request)
        request.company = company
        return None
