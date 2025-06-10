import io

import ddt
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from api.applications.admin_views.urls import ADMIN_INVESTOR_ACCOUNT_CODE_BULK_UPDATE
from core.base_tests import BaseTestCase
from core.tests.auth_base_test import AuthBaseTest
from rest_framework import status

from api.applications.admin_views import applications as views
from api.applications.admin_views import document_views
from api.applications.admin_views import urls
from api.documents.models import ApplicationSupportingDocument
from api.documents.tests.factories import ApplicationSupportingDocumentFactory


def bulk_update_file():
    file = SimpleUploadedFile.from_dict({
        "filename": "some_file.csv",
        "content": "".encode('utf-8'),
        "content-type": "text/csv"
    })
    return file

@ddt.ddt
class AdminEnpointsApplicationTest(AuthBaseTest):
    url_patterns = [url for url in urls.urlpatterns if url.name != ADMIN_INVESTOR_ACCOUNT_CODE_BULK_UPDATE]  # ignore the bulk update for investor account codes, it's hard to modify this

    @ddt.data(
        (
            'admin-list-applications-view',
            {'fund_external_id': '87efdydfb7h'},
            views.ApplicationListAPIView.as_view(),
            'get'
        ),
        (
            'application-company-documents',
            {'application_id': '12'},
            document_views.ApplicationCompanyDocumentListAPIView.as_view(),
            'get'
        ),
        (
            'application-company-documents-include-deleted',
            {'application_id': '12'},
            document_views.ExistingApplicationCompanyDocumentListAPIView.as_view(),
            'get'
        ),
        (
            'application-company-document-update-api',
            {'application_id': '12', 'pk': '12'},
            document_views.ApplicationCompanyDocumentUpdateAPIView.as_view(),
            'put'
        ),
        (
            'gp-signing-company-documents-signing-url',
            {'fund_external_id': '87efdydfb7h', 'envelope_id': '12'},
            document_views.GetGPSigningURLAPIView.as_view(),
            'get'
        ),
        (
            'applicant-management-list-view',
            {'fund_external_id': '87efdydfb7h'},
            views.ApplicantManagementListView.as_view(),
            'get'
        ),
        (
            'gp-signing-company-documents-store-url',
            {'fund_external_id': '87efdydfb7h', 'envelope_id': '12'},
            document_views.StoreGPSignedResponse.as_view(),
            'get'
        ),
        (
            'applicants-export-view',
            {'fund_external_id': '87efdydfb7h'},
            views.ExportApplicationsView.as_view(),
            'get'
        ),
        (
            'remove-applications',
            {'fund_external_id': '87efdydfb7h'},
            views.RemoveApplicationsAPIView.as_view(),
            'post'
        ),
        (
            'applicants-aml-kyc-export-view',
            {'fund_external_id': '87efdydfb7h'},
            views.ExportApplicationAmlKycData.as_view(),
            'get'
        ),
        (
            'applications-actions-view',
            {},
            views.BulkUpdateApplicationStatus.as_view(),
            'post'
        ),
        (
            'application-update',
            {},
            views.ApplicationUpdateVehicleAndShareClass.as_view(),
            'post'
        ),
        (
            'application-document-request-response-list',
            {'application_id': '12'},
            views.ApplicationDocumentRequestResponseListView.as_view(),
            'get'
        ),
        (
            'application-document-request-list',
            {'application_id': '12'},
            views.ApplicationDocumentsRequestsListView.as_view(),
            'get'
        ),
        (
            'applicant-retrieve-view',
            {'pk': '12'},
            views.ApplicationRetrieveView.as_view(),
            'get'
        ),
        (
            'applicant-investor-account-code-view',
            {'application_id': '12'},
            views.ApplicationInvestorAccountCodeView.as_view(),
            'get'
        ),
        (
            'application-document-request-create',
            {},
            views.ApplicationDocumentRequestCreateView.as_view(),
            'post'
        ),
        (
            'admin-application-reset-view',
            {},
            views.ApplicationResetAPIView.as_view(),
            'post'
        ),
        (
            'application-supporting-document-list-create',
            {'application_id': '12'},
            document_views.SupportingDocumentView.as_view(),
            'get'
        ),
        (
            'application-supporting-document-retrieve-update-destroy',
            {'application_id': '12', 'pk': '12'},
            document_views.SupportingDocumentRetrieveUpdateDestroyView.as_view(),
            'get'
        )
    )
    @ddt.unpack
    def test_urls(self, url_pattern, kwargs, view, method):
        self.assert_admin_request(view, url_pattern, method, kwargs)

    def test_xxx_url_coverage(self):
        self.assert_url_coverage()


class SupportingDocumentViewTest(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.create_user()
        self.create_card_workflow(company=self.company)
        self.setup_fund(company=self.company)
        self.application = self.create_application(company_user=self.company_user)
        self.url = reverse(
            'application-supporting-document-list-create',
            kwargs={'application_id': self.application.id}
        )

    def test_list_supporting_documents_with_no_user(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_supporting_documents_with_simple_user(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_supporting_documents_with_admin_user(self):
        ApplicationSupportingDocumentFactory(application=self.application)

        self.client.force_authenticate(self.admin_user.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_supporting_document(self):
        document_file = io.BytesIO(b"The greatest document in human history")
        data = {
            "document_name": "Test Document",
            "document_description": "Test document description",
            "document_file": document_file
        }

        self.client.force_authenticate(self.admin_user.user)
        response = self.client.post(self.url, data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class SupportingDocumentRetrieveUpdateDestroyViewTest(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.create_user()
        self.create_card_workflow(company=self.company)
        self.setup_fund(company=self.company)
        self.application = self.create_application(company_user=self.company_user)
        self.supporting_document = ApplicationSupportingDocumentFactory(application=self.application)
        self.url = reverse(
            'application-supporting-document-retrieve-update-destroy',
            kwargs={'application_id': self.application.id, 'pk': self.supporting_document.id}
        )

    def test_retrieve_supporting_document(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin_user.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['document_name'], self.supporting_document.document_name)

    def test_delete_supporting_document(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin_user.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_update_supporting_document(self):
        updated_name = "Test document updated"
        data = {
            "document_name": updated_name,
        }

        response = self.client.patch(self.url, data=data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(self.user)
        response = self.client.patch(self.url, data=data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.admin_user.user)
        response = self.client.patch(self.url, data=data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # assert that the document name is updated
        new_doc = ApplicationSupportingDocument.objects.filter(deleted=False).first()
        self.assertEqual(new_doc.document_name, updated_name)
