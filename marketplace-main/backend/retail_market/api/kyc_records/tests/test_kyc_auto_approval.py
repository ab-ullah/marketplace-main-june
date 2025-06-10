import json
from datetime import timedelta

from django.contrib.auth.models import Group
from django.urls import reverse
from django.utils import timezone
from slugify import slugify

from api.applications.tests.factories import ApplicationFactory
from api.cards.default.workflow_types import WorkflowTypes
from api.cards.models import Workflow as CardWorkFlow
from api.kyc_records.models import KYCRiskEvaluation
from api.kyc_records.tests.factories import KYCRecordFactory, CardWorkFlowFactory
from api.users.constants import FINANCIAL_ELIGIBILITY_REVIEWER
from api.workflows.models import Task
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService
from core.base_tests import BaseTestCase


class KYCAutoApproveTestCase(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.client.force_authenticate(self.user)
        self.setup_fund(company=self.company)
        financial_review_group = Group.objects.get(name=FINANCIAL_ELIGIBILITY_REVIEWER)
        self.admin_user.groups.add(financial_review_group)

    def get_kyc_record(self):
        name = "{} {}".format(WorkflowTypes.PRIVATE_COMPANY.value, self.company.name)
        workflow = CardWorkFlowFactory(
            name=name,
            slug=slugify(name),
            company=self.company,
            type=CardWorkFlow.FLOW_TYPES.KYC.value,
        )
        return KYCRecordFactory(
            company=self.company,
            user=self.user,
            workflow=workflow,
            approved=True,
            company_user=self.company_user
        )

    def setup_admin_workflow(self, kyc_record):
        on_boarding_workflow_service = UserOnBoardingWorkFlowService(
            fund=self.fund,
            company_user=self.company_user
        )
        workflow = on_boarding_workflow_service.get_or_create_kyc_workflow(kyc_record=kyc_record)
        ApplicationFactory(
            company=self.company,
            fund=self.fund,
            user=self.user,
            workflow=workflow.parent,
            kyc_record=kyc_record
        )
        return workflow

    def test_kyc_record_update_mark_approved_false(self):
        kyc_record = self.get_kyc_record()

        workflow = self.setup_admin_workflow(kyc_record=kyc_record)
        workflow.is_completed = True
        workflow.save()

        url = reverse('kyc-record-get-update-view', kwargs={
            'wf_slug': kyc_record.workflow.slug,
            'pk': kyc_record.pk
        })
        payload = {
            'source_of_wealth': 'updated source of wealth',
            'fund_external_id': self.fund.external_id
        }
        response = self.client.patch(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        kyc_record.refresh_from_db()
        workflow.refresh_from_db()
        self.assertEqual(kyc_record.user_id, self.user.id)
        self.assertFalse(kyc_record.approved)
        self.assertFalse(workflow.is_completed)


    def test_kyc_record_with_task_update_mark_approved_false(self):
        kyc_record = self.get_kyc_record()

        workflow = self.setup_admin_workflow(kyc_record=kyc_record)
        workflow.is_completed = True
        workflow.save()

        Task.objects.create(
            workflow=workflow,
            task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value
        )

        url = reverse('kyc-record-get-update-view', kwargs={
            'wf_slug': kyc_record.workflow.slug,
            'pk': kyc_record.pk
        })

        payload = {
            'source_of_wealth': 'updated source of wealth',
            'fund_external_id': self.fund.external_id
        }
        response = self.client.patch(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        kyc_record.refresh_from_db()
        workflow.refresh_from_db()
        self.assertEqual(kyc_record.user_id, self.user.id)
        self.assertFalse(kyc_record.approved)
        self.assertTrue(workflow.is_completed)

    def test_kyc_workflow_not_auto_approved_for_high_risk(self):
        kyc_record = self.get_kyc_record()
        workflow = self.setup_admin_workflow(kyc_record=kyc_record)

        financial_review_group = Group.objects.get(name=FINANCIAL_ELIGIBILITY_REVIEWER)
        self.admin_user.groups.add(financial_review_group)
        KYCRiskEvaluation.objects.create(
            kyc_record=kyc_record,
            reviewer=self.admin_user,
            risk_value=KYCRiskEvaluation.RiskValueChoices.HIGH.value

        )
        url = reverse('kyc-review-view', kwargs={
            'kyc_record_id': kyc_record.id,
            'fund_external_id': self.fund.external_id
        })
        response = self.client.get(
            url,
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        workflow.refresh_from_db()
        self.assertFalse(workflow.is_completed)
        self.assertEqual(
            workflow.workflow_tasks.filter(task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value).count(),
            1
        )

    def test_kyc_workflow_not_auto_approved_for_low_risk_expired_id(self):
        kyc_record = self.get_kyc_record()
        workflow = self.setup_admin_workflow(kyc_record=kyc_record)

        old_date = (timezone.now() - timedelta(days=2)).date()
        kyc_record.id_expiration_date = old_date
        kyc_record.save()

        KYCRiskEvaluation.objects.create(
            kyc_record=kyc_record,
            reviewer=self.admin_user,
            risk_value=KYCRiskEvaluation.RiskValueChoices.LOW.value

        )
        url = reverse('kyc-review-view', kwargs={
            'kyc_record_id': kyc_record.id,
            'fund_external_id': self.fund.external_id
        })
        response = self.client.get(
            url,
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        workflow.refresh_from_db()
        self.assertFalse(workflow.is_completed)
        self.assertEqual(
            workflow.workflow_tasks.filter(task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value).count(),
            1
        )

    def test_kyc_workflow_auto_approved_for_low_risk(self):
        kyc_record = self.get_kyc_record()
        workflow = self.setup_admin_workflow(kyc_record=kyc_record)

        KYCRiskEvaluation.objects.create(
            kyc_record=kyc_record,
            reviewer=self.admin_user,
            risk_value=KYCRiskEvaluation.RiskValueChoices.LOW.value

        )
        url = reverse('kyc-review-view', kwargs={
            'kyc_record_id': kyc_record.id,
            'fund_external_id': self.fund.external_id
        })
        response = self.client.get(
            url,
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        workflow.refresh_from_db()
        self.assertTrue(workflow.is_completed)
        self.assertEqual(
            workflow.workflow_tasks.filter(task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value).count(),
            0
        )

    def test_kyc_workflow_auto_approved_for_low_risk_future_expiry(self):
        kyc_record = self.get_kyc_record()
        workflow = self.setup_admin_workflow(kyc_record=kyc_record)

        new_date = (timezone.now() + timedelta(days=2)).date()
        kyc_record.id_expiration_date = new_date
        kyc_record.save()

        KYCRiskEvaluation.objects.create(
            kyc_record=kyc_record,
            reviewer=self.admin_user,
            risk_value=KYCRiskEvaluation.RiskValueChoices.LOW.value

        )
        url = reverse('kyc-review-view', kwargs={
            'kyc_record_id': kyc_record.id,
            'fund_external_id': self.fund.external_id
        })
        response = self.client.get(
            url,
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        workflow.refresh_from_db()
        self.assertTrue(workflow.is_completed)
        self.assertEqual(
            workflow.workflow_tasks.filter(task_type=Task.TaskTypeChoice.REVIEW_REQUEST.value).count(),
            0
        )
