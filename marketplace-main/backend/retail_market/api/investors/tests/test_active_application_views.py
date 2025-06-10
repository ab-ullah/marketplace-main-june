from django.urls import reverse
from rest_framework import status

from api.applications.models import Application
from api.applications.tests.factories import ApplicationFactory
from api.constants.kyc_investor_types import KYCInvestorType
from api.eligibility_criteria.services.get_eligibility_criteria_user_response import \
    FundEligibilityCriteriaPreviewResponse
from api.eligibility_criteria.tests.factories import (
    ApplicationFactory, EligibilityCriteriaBlockResponseFactory,
    FundEligibilityCriteriaFactory, FundEligibilityCriteriaResponseFactory)
from api.geographics.models import Country
from api.kyc_records.tests.factories import KYCRecordFactory
from api.partners.tests.factories import FundFactory
from api.tax_records.tests.factories import TaxRecordFactory
from core.base_tests import BaseTestCase


class TestActiveApplicationViews(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.client.force_authenticate(self.user)
        self.create_currency()

    def setup_application(self):
        fund = FundFactory(company=self.company, accept_applications=True, is_published=True)
        fund_eligibility_criteria = FundEligibilityCriteriaFactory(fund=fund)

        country = Country.objects.get(iso_code__iexact="AL")
        FundEligibilityCriteriaPreviewResponse(
            fund,
            self.user,
            country,
            'INDIVIDUAL',
            {
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'occupation': "Job Title",
                'eligibility_country': country,
                'department': {'label': 'Accounting', 'value': 'accounting'},
                'job_band': {'label': 'M2', 'value': 'M2'},
                'job_title': "Job Title",
                'office_location': country
            }
        )
        kyc_record = KYCRecordFactory(
            user=self.user,
            company=self.company,
            company_user=self.company_user,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
        )

        fund_eligibility_criteria_response = FundEligibilityCriteriaResponseFactory(
            criteria=fund_eligibility_criteria,
            response_by=self.company_user,
            kyc_record=kyc_record
        )
        EligibilityCriteriaBlockResponseFactory(criteria_response=fund_eligibility_criteria_response)

        application = ApplicationFactory(
            fund=fund,
            company=self.company,
            user=self.user,
            kyc_record=kyc_record,
            tax_record=TaxRecordFactory(
                user=self.user,
                company=self.company,
            ),
            eligibility_response=fund_eligibility_criteria_response,
        )
        return fund, application

    def test_active_applications(self):
        fund_1, application_1 = self.setup_application()
        fund_2, application_2 = self.setup_application()

        url = reverse('active-applications')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        actual_external_id_list = [fund_1.external_id, fund_2.external_id]
        expected_external_id_list = [d['external_id'] for d in response.data]

        self.assertEqual(sorted(actual_external_id_list), sorted(expected_external_id_list))

    def test_past_applications(self):
        fund_1, application_1 = self.setup_application()
        fund_2, application_2 = self.setup_application()
        fund_3, application_3 = self.setup_application()
        fund_4, application_4 = self.setup_application()

        application_1.status = Application.Status.DENIED.value
        application_1.save()

        application_2.status = Application.Status.WITHDRAWN.value
        application_2.save()

        fund_document_1 = self.create_fund_document(require_gp_sign=True, fund=fund_4)
        fund_document_2 = self.create_fund_document(require_gp_sign=True, fund=fund_4)
        fund_document_3 = self.create_fund_document(require_gp_sign=False, fund=fund_4)

        applicant_document_1 = self.create_applicant_document(fund_document=fund_document_1, application=application_4)
        applicant_document_1.completed = True
        applicant_document_1.save()

        applicant_document_2 = self.create_applicant_document(fund_document=fund_document_2, application=application_4)
        applicant_document_2.completed = True
        applicant_document_2.save()

        applicant_document_3 = self.create_applicant_document(fund_document=fund_document_3, application=application_4)
        applicant_document_3.completed = True
        applicant_document_3.save()

        url = reverse('investor-past-opportunities')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        actual_external_id_list = {fund_1.external_id, fund_2.external_id}
        expected_external_id_list = {d['external_id'] for d in response.data}
        self.assertEqual(actual_external_id_list, expected_external_id_list)

        applicant_document_1.gp_signing_complete = True
        applicant_document_1.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(actual_external_id_list, expected_external_id_list)

        applicant_document_2.gp_signing_complete = True
        applicant_document_2.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        actual_external_id_list = {fund_1.external_id, fund_2.external_id, fund_4.external_id}
        expected_external_id_list = {d['external_id'] for d in response.data}
        self.assertEqual(actual_external_id_list, expected_external_id_list)
