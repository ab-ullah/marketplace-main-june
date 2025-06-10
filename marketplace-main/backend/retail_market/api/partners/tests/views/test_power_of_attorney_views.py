import io

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.companies.services.company_service import CompanyService, LASALLE_COMPANY_NAME
from api.constants.headers import API_KEY_HEADER


class PowerOfAttorneyViewsAPITestCase(APITestCase):

    def setUp(self):
        company_info = CompanyService.create_company(company_name=LASALLE_COMPANY_NAME)
        self.request_count = 0
        self.company = company_info['company']
        self.api_token = company_info['token']

    def get_headers(self):
        self.request_count = self.request_count + 1

        return {
            API_KEY_HEADER: self.api_token,
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }

    def test_power_of_attorney_view(self):
        self.assertIsNone(self.company.power_of_attorney_document)
        content_type = "application/text"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        url = reverse('power-of-attorney-create-api-view')
        payload = {
            'id': 'investDoc-01',
            'file_name': 'temp_file',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
        }
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.company.refresh_from_db()
        self.assertIsNotNone(self.company.power_of_attorney_document)
