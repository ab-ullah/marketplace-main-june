import ddt

from core.tests.auth_base_test import AuthBaseTest
from api.tax_records.admin_views import tax_records as views
from api.tax_records.admin_views import urls


@ddt.ddt
class AdminEnpointsTaxTest(AuthBaseTest):
    url_patterns = urls.urlpatterns

    def test_xxx_url_coverage(self):
        print('testing coverage')
        self.assert_url_coverage()

    @ddt.data(
        ('admin-list-tax-records-view', {}, views.TaxRecordsListAPIView.as_view(), 'get'),
        ('admin-list-tax-documents-view', {'record_id': '12'}, views.TaxDocumentListAPIView.as_view(), 'get'),
        ('admin-tax-forms-list-view', {}, views.TaxFormsListAPIView.as_view(), 'get'),
        ('admin-create-tax-documents-view', {}, views.CreateTaxDocumentAPIView.as_view(), 'get'),
        ('admin-list-all-tax-documents-view', {'record_id': '12'}, views.AllTaxDocumentListAPIView.as_view(), 'get'),
        ('admin-update-tax-documents-view',{'record_id': '12', 'pk': '12', 'application_id': '12'}, views.TaxDocumentUpdateAPIView.as_view(), 'get'),
        ('admin-fetch-tax-details', {'pk': '12'}, views.TaxRecordRetrieveAPIView.as_view(), 'get')
    )
    @ddt.unpack
    def test_urls(self, url_pattern, kwargs, view, method):
        self.assert_admin_request(view, url_pattern, method, kwargs)
