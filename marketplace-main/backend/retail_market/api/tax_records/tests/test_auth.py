from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from unittest import mock

from api.applications.tests.factories import ApplicationFactory
from api.partners.tests.factories import CompanyUserFactory, FundFactory
from api.tax_records.views import tax_forms as forms_views
from api.tax_records.views import tax_records as records_views

from api.tax_records.tests.factories import TaxFormFactory, TaxRecordFactory, TaxDocumentFactory
from core.tests.auth_base_test import AuthBaseTest

def mocked_docusign(*args, **kwargs):
        class MockResponse:
            def __init__(self):
                self.envelope_id = 'fake_envelope_id'

            def send_embedded(self, args):
                return {'redirect_url': 'fake_docusign_url'}

            def create_envelope(self, args):
                return MockResponse()

            def get_document(self, *args, **kwargs):
                return 'fake_path'

            def get_envelope_documents(self, envelope_id):
                return MockResponse()

        return MockResponse()


class TaxFormAuthTestCase(APITestCase, AuthBaseTest):

    def test_tax_form_list_view(self):
        url_name = 'admin-list-tax-records-view'
        kwargs = {}
        view = forms_views.TaxFormListAPIView.as_view()
        #try no user
        response = self.do_authenticated_request(view, url_name, "get", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
   
    
    
    @mock.patch('api.tax_records.views.tax_forms.DocumentSigningService', side_effect=mocked_docusign) 

    def test_signing_url_view(self, mocked_docusign):     
        url_name = 'signing-url-tax-form-view'
        envelope_id = "fake_envelope_id"
        kwargs = {'envelope_id': envelope_id}
        payload = {'return_url': 'fake_url'}
        cu_owner = CompanyUserFactory(company = self.company_user.company)
        tax_record = TaxRecordFactory(user = cu_owner.user, company = cu_owner.company)
        tax_document = TaxDocumentFactory(envelope_id= envelope_id, tax_record= tax_record, owner = cu_owner.user)

        #user is not the owner should return forbidden
        view = forms_views.SigningURLAPIView.as_view()
        response = self.do_authenticated_request(view, url_name, "get", self.simple_user, kwargs)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        #this is the owner, it should get through
        url = reverse(url_name, kwargs=kwargs)
        self.client.force_authenticate(cu_owner.user)
        response = self.client.get(url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
class TaxRecordAuthTestCase(APITestCase, AuthBaseTest):
   
    def test_tax_records_create_view(self):     
        url_name = 'tax-records-list-create'
        kwargs = {'fund_external_id': 'fake-external-id'}
        view = records_views.TaxRecordCreateAPIView.as_view()
        #try no user
        response = self.do_authenticated_request(view, url_name, "post", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tax_records_list_view(self):
        fund = FundFactory(company=self.company, accept_applications=True)
        url_name = 'tax-records-list-create'
        kwargs = {'fund_external_id': fund.external_id}
        view = records_views.TaxRecordCreateAPIView.as_view()
        #try no user
        response = self.do_authenticated_request(view, url_name, "get", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #create a record try user with no records then the one with a single record
        cu_owner = CompanyUserFactory(company = self.company_user.company)
        tax_record = TaxRecordFactory(user = cu_owner.user, company = cu_owner.company)
        ApplicationFactory(company=self.company, fund=fund, user=cu_owner.user)
        response = self.do_authenticated_request(view, url_name, "get", self.simple_user, kwargs)
        self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.do_authenticated_request(view, url_name, "get", cu_owner.user, kwargs)
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), 1)

    @mock.patch('api.tax_records.services.create_tax_document.DocumentSigningService', side_effect=mocked_docusign) 
    def test_create_envelope_view(self, mocked_docusign):     
        url_name = 'create-envelope-view'
        kwargs = {'tax_record_id': 'fake-uuid'}
        view = records_views.TaxDocumentCreateAPIView.as_view()
        #try no user
        response = self.do_authenticated_request(view, url_name, "post", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
        # try simple user
        tax_record = TaxRecordFactory(user=self.simple_user, company=self.company_user.company)
        kwargs['tax_record_id'] = tax_record.uuid
        form = TaxFormFactory(company=self.company_user.company)
        payload = {'tax_record_id': tax_record.id, 'form_id': form.form_id}
        self.client.force_authenticate(self.simple_user)
        url = reverse(url_name, kwargs=kwargs)
        response = self.client.post(url, payload)
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)

    @mock.patch('api.tax_records.serializers.DocumentSigningService', side_effect=mocked_docusign)
    @mock.patch('api.tax_records.serializers.SaveFormSerializer.save_form', return_value='fake_path')
    @mock.patch('api.tax_records.serializers.TaxReviewService.start_review', return_value={})
    def test_save_tax_document_view(self, mocked_docusign, mock_save_form, mock_start_review):
        fund = FundFactory(company=self.company, accept_applications=True)
        url_name = 'save-tax-document-view'
        kwargs = {'fund_external_id': fund.external_id, 'envelope_id': 'fake-envelope-id'}
        view = records_views.SaveFormAPIView.as_view()
        #try no user
        response = self.do_authenticated_request(view, url_name, "put", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #try non owner user
        cu_owner = CompanyUserFactory(company = self.company_user.company)
        tax_record = TaxRecordFactory(user = cu_owner.user, company = cu_owner.company)
        form = TaxFormFactory(company = cu_owner.company)
        tax_document = TaxDocumentFactory(tax_record = tax_record, form = form, owner = cu_owner.user, envelope_id='fake_envelope_id')
        ApplicationFactory(company=cu_owner.company, fund=fund, user=cu_owner.user)
        kwargs['envelope_id'] = tax_document.envelope_id
        response = self.do_authenticated_request(view, url_name, "put", self.simple_user, kwargs)
        self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)
        #try owner
        response = self.do_authenticated_request(view, url_name, "put", cu_owner.user, kwargs)
        self.assertEquals(response.status_code, status.HTTP_200_OK)
    
    def test_list_tax_document_view(self):     
        url_name = 'list-tax-document-view'
        kwargs = {'tax_record_id' : 'fake_id'}
        view = records_views.TaxDocumentListAPIView.as_view()
        #try no user
        response = self.do_authenticated_request(view, url_name, "get", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #create a record try user with no records then the one with a single record
        cu_owner = CompanyUserFactory(company = self.company_user.company)
        tax_record = TaxRecordFactory(user = cu_owner.user, company = cu_owner.company)
        form = TaxFormFactory(company = cu_owner.company)
        tax_document = TaxDocumentFactory(tax_record = tax_record, form = form, owner = cu_owner.user, envelope_id='fake_envelope_id')
        kwargs = {'tax_record_id' : tax_record.uuid}
        response = self.do_authenticated_request(view, url_name, "get", self.simple_user, kwargs)
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(response.data, [])
        response = self.do_authenticated_request(view, url_name, "get", cu_owner.user, kwargs)
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), 1)
    
    def test_tax_document_delete_view(self):     
        url_name = 'tax-document-delete-view'
        kwargs = {'tax_record_id' : 'fake_id',
                    'document_id' : 'fake_doc_id'}
        view = records_views.TaxDocumentDeleteAPIView.as_view()
        #try no user
        response = self.do_authenticated_request(view, url_name, "delete", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #create a record try user with no records then the one with a single record
        cu_owner = CompanyUserFactory(company = self.company_user.company)
        tax_record = TaxRecordFactory(user = cu_owner.user, company = cu_owner.company)
        form = TaxFormFactory(company = cu_owner.company)
        tax_document = TaxDocumentFactory(tax_record = tax_record, form = form, owner = cu_owner.user, envelope_id='fake_envelope_id')
        kwargs = {'tax_record_id' : tax_record.id,
                'document_id': tax_document.document.document_id}
        response = self.do_authenticated_request(view, url_name, "delete", self.simple_user, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.do_authenticated_request(view, url_name, "delete", cu_owner.user, kwargs)
        self.assertEquals(response.status_code, status.HTTP_202_ACCEPTED)
