import json

from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from api.applications.models import Application
from api.applications.tests.factories import ApplicationFactory, FundFactory
from api.constants.kyc_investor_types import KYCInvestorType
from api.kyc_records.models import KYCRecord
from api.kyc_records.tests.factories import KYCRecordFactory
from api.partners.tests.factories import WorkFlowFactory
from api.tax_records.models import TaxRecord
from api.tax_records.tests.factories import TaxRecordFactory
from core.base_tests import BaseTestCase


class TestApplicationResetAPIView(BaseTestCase):
    def setUp(self) -> None:
        self.create_user()
        self.create_fund(company=self.company)
        self.create_eligibility_criteria_for_fund()
        self.create_card_workflow(company=self.company)
        self.client.force_authenticate(self.admin_user.user)

    def get_application(self, kyc_record, fund=None):
        if not fund:
            fund = self.fund

        application = ApplicationFactory(
            fund=fund,
            company=self.company,
            user=self.user,
            status=Application.Status.APPROVED.value,
            kyc_record=kyc_record,
            tax_record=TaxRecordFactory(
                user=self.user,
                company=self.company,
            ),
            eligibility_response=self.create_eligibility_criteria_user_response(company_user=self.company_user),
        )
        parent_workflow = WorkFlowFactory(company=self.company)
        application.workflow = parent_workflow
        application.save()
        return application

    def test_all_validation_fail(self):
        kyc_record_individual = KYCRecordFactory(
            user=self.user,
            company=self.company,
            company_user=self.company_user,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
        )
        application = self.get_application(kyc_record=kyc_record_individual)
        url = reverse('admin-application-reset-view')
        payload = {'ids': [application.id]}
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @override_settings(APP_ENVIRONMENT='prod')
    def test_environment_fail(self):
        kyc_record_individual = KYCRecordFactory(
            user=self.user,
            company=self.company,
            company_user=self.company_user,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
        )
        application = self.get_application(kyc_record=kyc_record_individual)
        url = reverse('admin-application-reset-view')
        self.make_full_access_admin(admin_user=self.admin_user)
        payload = {'ids': [application.id]}
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @override_settings(APP_ENVIRONMENT="dev")
    def test_all_validation_pass(self):
        kyc_record_individual = KYCRecordFactory(
            user=self.user,
            company=self.company,
            company_user=self.company_user,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
        )

        kyc_record_partnership = KYCRecordFactory(
            user=self.user,
            company=self.company,
            company_user=self.company_user,
            kyc_investor_type=KYCInvestorType.LIMITED_PARTNERSHIP.value,
        )

        application = self.get_application(kyc_record=kyc_record_individual)
        application.gp_signing_completed_at = timezone.now()
        application.save(update_fields=['gp_signing_completed_at'])
        application_same_kyc = self.get_application(kyc_record=kyc_record_individual,
                                                    fund=FundFactory(partner_id='123'))
        application_different_kyc = self.get_application(kyc_record=kyc_record_partnership,
                                                         fund=FundFactory(partner_id='345'))
        kyc_record = application.kyc_record
        tax_record = application.tax_record
        url = reverse('admin-application-reset-view')
        self.make_full_access_admin(admin_user=self.admin_user)
        payload = {'ids': [application.id]}
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        application.refresh_from_db()
        application_same_kyc.refresh_from_db()
        application_different_kyc.refresh_from_db()
        self.assertIsNone(application.eligibility_response)
        self.assertIsNone(application.workflow)
        self.assertIsNone(application.tax_record)
        self.assertIsNone(application.kyc_record)
        self.assertIsNone(application.gp_signing_completed_at)
        self.assertFalse(application.allocation_approval_email_sent)
        # self.assertEqual(application.status, Application.Status.CREATED.value)
        # self.assertIsNone(application_same_kyc.eligibility_response)
        # self.assertIsNone(application_same_kyc.workflow)
        # self.assertIsNone(application_same_kyc.tax_record)
        # self.assertIsNone(application_same_kyc.kyc_record)
        self.assertFalse(application.allocation_approval_email_sent)
        self.assertIsNotNone(application_different_kyc.eligibility_response)
        self.assertIsNotNone(application_different_kyc.workflow)
        self.assertIsNotNone(application_different_kyc.tax_record)
        self.assertIsNotNone(application_different_kyc.kyc_record)
        self.assertEqual(application.status, Application.Status.CREATED.value)
        self.assertFalse(KYCRecord.objects.filter(id=kyc_record.id).exists())
        self.assertFalse(TaxRecord.objects.filter(id=tax_record.id).exists())
        self.assertTrue(KYCRecord.include_deleted.filter(id=kyc_record.id).exists())
        self.assertTrue(TaxRecord.include_deleted.filter(id=tax_record.id).exists())
