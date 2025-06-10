from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase


from api.partners.tests.factories import CompanyUserFactory
from api.applications.views import application_views as views
from api.applications.tests import factories
from core.tests.auth_base_test import AuthBaseTest



class ApplicationAuthTestCase(APITestCase, AuthBaseTest):
    
    def test_application_retrieve_view(self):
        cu_owner = CompanyUserFactory(company=self.company_user.company)
        fund = factories.FundFactory(company=self.company_user.company)

        url_name = 'application-retrieve'
        kwargs = {'fund_external_id': fund.external_id}
        view = views.ApplicationListAPIView.as_view()
        #try no user
        response = self.do_authenticated_request(view, url_name, "get", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #try with simple user
        application = factories.ApplicationFactory(user = cu_owner.user, company = cu_owner.company, fund=fund )
        response = self.do_authenticated_request(view, url_name, "get", self.simple_user, kwargs)
        self.assertEquals(len(response.data), 0)
         #try with owner
        response = self.do_authenticated_request(view, url_name, "get", cu_owner.user, kwargs)
        self.assertEquals(len(response.data), 1)
    
    def test_application_create_view(self):     
        url_name = 'application-create'
        kwargs = {}
        view = views.ApplicationCreateAPIView.as_view()
        payload = {}
        #try no user
        response = self.do_authenticated_request(view, url_name, "post", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #try with a user that doesn't have access to the fund's company
        cu_owner = CompanyUserFactory()
        fund = factories.FundFactory(company = cu_owner.company, slug= "test-slug")
        payload = {'fund_slug': 'test-slug', 'user': self.simple_user.id, 'company': cu_owner.company.id}
        self.client.force_authenticate(self.simple_user)   
        url = reverse(url_name, kwargs=kwargs)
        response = self.client.post(url, payload)
        self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)
        #try with a user that DOES have access to the fund's company
        self.client.force_authenticate(cu_owner.user)   
        url = reverse(url_name, kwargs=kwargs)
        response = self.client.post(url, payload)
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
    
    def test_application_update_view(self):
        url_name = 'application-update'
        kwargs = {'uuid': 'fake-uuid'}
        view = views.ApplicationUpdateAPIView.as_view()
        #try no user
        response = self.do_authenticated_request(view, url_name, "put", None, kwargs)
        self.assertEquals(response.status_code, status.HTTP_401_UNAUTHORIZED)
        #try with a user that doesn't own the application
        cu_owner = CompanyUserFactory()
        fund = factories.FundFactory(company = cu_owner.company, slug= "test-slug")
        application = factories.ApplicationFactory(fund = fund, user = cu_owner.user, company=cu_owner.company)
        self.client.force_authenticate(self.simple_user)
        kwargs = {'uuid': application.uuid}
        payload = {'fund_slug': 'test-slug', 'user': self.simple_user.id, 'company': cu_owner.company.id}
        url = reverse(url_name, kwargs=kwargs)
        response = self.client.put(url, payload)
        self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)
        #try with a user that DOES have access to the fund's company
        self.client.force_authenticate(cu_owner.user)
        url = reverse(url_name, kwargs=kwargs)
        response = self.client.put(url, payload)
        self.assertEquals(response.status_code, status.HTTP_200_OK)
