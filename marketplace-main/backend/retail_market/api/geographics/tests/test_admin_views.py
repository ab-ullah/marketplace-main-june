from core.tests.auth_base_test import AuthBaseTest

from api.geographics.admin_views import country_region_views as views
from api.geographics.admin_views import urls

class AdminEnpointsGeographicsTest(AuthBaseTest):
    url_patterns = urls.urlpatterns

    def test_xxx_url_coverage(self):
        print('testing coverage')
        self.assert_url_coverage() 

    def test_list_application_records(self):
        url_pattern = 'admin-region-country'
        kwargs = {}
        view = views.CountryRegionAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)
        
    def test_list_id_records(self):
        url_pattern = 'admin-id-documents-by-country'
        kwargs = {}
        view = views.IdDocumentTypeByCountry.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)