from unittest import mock

from django.contrib.auth.models import Group
from django.urls import reverse

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.applications.models import Application
from api.cards.default.workflow_types import WorkflowTypes
from api.cards.default.workflows import create_workflow_for_company
from api.eligibility_criteria.models import EligibilityCriteriaResponse
from api.kyc_records.services.aml_kyc_review import AmlKycReviewService
from api.partners.tests.factories import UserFactory, CompanyUserFactory, CompanyFactory
from api.tax_records.tests.factories import TaxRecordFactory
from api.users.constants import FINANCIAL_ELIGIBILITY_REVIEWER
from api.workflows.models import Task
from api.workflows.tests.factories import CompanyUserTaskFactory
from core.base_tests import BaseTestCase


class TasksTestCase(BaseTestCase):

    def setUp(self):
        self.create_user()

        self.client.force_authenticate(self.user)
        self.setup_fund(company=self.company)
        self.admin_user = CreateAdminUserService(email=self.user.email, company_name=self.company.name,
                                                 title='Test Signer').create()
        group = Group.objects.create(name="My test admin group")
        another_group = Group.objects.create(name="My test admin group 2")
        self.admin_user.groups.add(group)
        self.admin_user.groups.add(another_group)
        self.admin_user.save()
        self.workflow = self.create_workflow(self.company, self.admin_user)
        create_workflow_for_company(company=self.company, type=WorkflowTypes.INDIVIDUAL)
        self.create_countries()
        self.create_user_tasks()
        self.create_another_user_tasks()
        self.create_another_user_tasks_same_group()
        self.create_company_2_admin_user()

    def create_company_2_admin_user(self):
        self.company_2 = CompanyFactory.create(name="Another company")
        self.company_2_user = UserFactory(username="Sarasa")
        self.company_2_admin_user = CreateAdminUserService(email=self.company_2_user.email,
                                                           company_name=self.company_2.name,
                                                           title='Test Signer another company').create()
        for g in self.admin_user.groups.all():
            self.company_2_admin_user.groups.add(g)
        self.company_2_admin_user.save()

    def create_user_tasks(self):
        self.tasks = [
            CompanyUserTaskFactory(
                assigned_to_user=self.company_user,
                assigned_to_group=self.admin_user.groups.first(),
                assigned_to=self.admin_user,
                workflow=self.workflow,
                task_type=Task.TaskTypeChoice.CHANGES_REQUESTED.value
            )
            for _ in range(10)
        ]

    def create_another_user_tasks(self):
        self.another_user = UserFactory()
        self.another_company_user = CompanyUserFactory(user=self.another_user)

        groups = [g for g in self.admin_user.groups.all()]
        self.other_users_tasks = [
            CompanyUserTaskFactory(
                assigned_to_user=self.another_company_user,
                assigned_to=self.admin_user,
                assigned_to_group=groups[-1],
                workflow=self.workflow,
                task_type=Task.TaskTypeChoice.CHANGES_REQUESTED.value
            )
            for _ in range(10)
        ]

    def create_another_user_tasks_same_group(self):
        self.another_user_same_group = UserFactory()
        self.another_admin_user_same_group = CreateAdminUserService(email=self.another_user_same_group.email,
                                                                    company_name=self.company.name,
                                                                    title='Test Signer 2').create()
        some_group = self.admin_user.groups.first()
        self.another_admin_user_same_group.groups.add(some_group)
        self.another_admin_user_same_group.save()
        self.another_company_user_same_group = CompanyUserFactory(user=self.another_user_same_group)

        self.other_user_same_groups_tasks = [
            CompanyUserTaskFactory(
                assigned_to_user=self.another_company_user_same_group,
                assigned_to=self.another_admin_user_same_group,
                assigned_to_group=some_group,
                workflow=self.workflow,
                task_type=Task.TaskTypeChoice.CHANGES_REQUESTED.value
            )
            for _ in range(10)
        ]

    def test_company_user_tasks_list(self):
        url = reverse('company-user-task-list-view')

        response = self.client.get(
            url,
            **self.get_headers()
        )

        self.assertEqual(self.tasks[0].assigned_to_user.user, self.user)
        self.assertEqual(self.workflow.id, response.data[0]['workflow'])
        self.assertEqual(self.company_user.id, response.data[0]['assigned_to_user'])
        self.assertEqual(len(self.tasks), len(response.data))

    @mock.patch('api.workflows.services.send_task_email.SendTaskEmail.send_task_added_email')
    def test_task_created_signal(self, mock_email_send):
        _ = Task.objects.create(
            workflow_id=self.workflow.id,
            assigned_to_id=self.admin_user.id,
            requestor=self.admin_user
        )

        self.assertEqual(mock_email_send.call_count, 1)

    @mock.patch('api.workflows.services.send_task_email.SendTaskEmail.send_task_added_email')
    def test_task_detail_retrieval(self, _):
        response_service = self.get_eligibility_response_service()
        response_service.get_user_criteria_response(self.fund_eligibility_criteria)

        self.assertEqual(EligibilityCriteriaResponse.objects.count(), 1)
        self.assertEqual(Application.objects.count(), 1)

        tax_record = TaxRecordFactory(
            company=self.company,
            user=self.company_user.user
        )

        application = Application.objects.first()
        application.tax_record = tax_record
        application.save()

        aml_review_service = AmlKycReviewService(
            kyc_record=application.kyc_record,
            fund=application.fund,
            user=application.user
        )
        workflow = aml_review_service.get_workflow()

        task = aml_review_service.create_task(
            group_name=FINANCIAL_ELIGIBILITY_REVIEWER,
            workflow=workflow,
            company=self.company
        )
        self.assertIsNone(task)
        self.create_financial_reviewer()

        task = aml_review_service.create_task(
            group_name=FINANCIAL_ELIGIBILITY_REVIEWER,
            workflow=workflow,
            company=self.company
        )
        self.assertIsNotNone(task)

        url = reverse('task-retrieve-update-view', kwargs={'pk': task.id})

        response = self.client.get(
            url,
            **self.get_headers()
        )

        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertEqual(data['id'], task.id)
        self.assertEqual(data['eligibility_response_id'], application.eligibility_response_id)
        self.assertEqual(data['tax_record_id'], application.tax_record_id)
        self.assertEqual(data['kyc_record_id'], application.kyc_record_id)
        self.assertEqual(data['fund_slug'], application.fund.slug)
        self.assertEqual(data['kyc_wf_slug'], application.kyc_record.workflow.slug)
        self.assertEqual(data['application_id'], application.id)

    def test_tasks_retrieval_after_application_withdrawn(self):
        response_service = self.get_eligibility_response_service()
        response_service.get_user_criteria_response(self.fund_eligibility_criteria)

        self.assertEqual(EligibilityCriteriaResponse.objects.count(), 1)
        self.assertEqual(Application.objects.count(), 1)

        application = Application.objects.first()

        aml_review_service = AmlKycReviewService(
            kyc_record=application.kyc_record,
            fund=application.fund,
            user=application.user
        )
        workflow = aml_review_service.get_workflow()

        task = aml_review_service.create_task(
            group_name=FINANCIAL_ELIGIBILITY_REVIEWER,
            workflow=workflow,
            company=self.company
        )

        application.status = Application.Status.WITHDRAWN
        application.save()

        url = reverse('tasks-list-view')

        response = self.client.get(url, **self.get_headers())

        self.assertEqual(len(response.data), 2)

    @mock.patch('api.workflows.services.send_task_email.SendTaskEmail.send_task_added_email')
    def test_tasks_listing(self, _):
        tasks = self.list_all_tasks()
        all_tasks = self.tasks + self.other_users_tasks + self.other_user_same_groups_tasks
        all_tasks_ids = {t.id for t in all_tasks}
        all_retrieved_task_ids = {t['id'] for t in tasks}
        self.assertEqual(all_tasks_ids, all_retrieved_task_ids)

        self.client.force_authenticate(self.another_user_same_group)
        another_tasks = self.list_all_tasks()
        tasks_same_group = self.tasks + self.other_user_same_groups_tasks
        another_tasks_ids = {t.id for t in tasks_same_group}
        another_retrieved_task_ids = {t['id'] for t in another_tasks}
        self.assertEqual(another_tasks_ids, another_retrieved_task_ids)

        self.client.force_authenticate(self.company_2_user)
        no_tasks = self.list_all_tasks()
        self.assertEqual(len(no_tasks), 0)

    def list_all_tasks(self):
        tasks = []
        url = reverse('tasks-list-view')
        while url:
            response = self.client.get(url, **self.get_headers())
            tasks.extend([task for task in response.data['results']])
            self.assertEqual(response.status_code, 200)
            url = response.data['links']['next']
        return tasks

    def test_tasks_listing_for_full_access_admin(self):
        base_user = UserFactory()
        test_admin_user = CreateAdminUserService(email=base_user.email,
                                                 company_name=self.company.name).create()
        test_company_user = CompanyUserFactory(user=self.another_user)
        test_group = Group.objects.create(name="test group")
        CompanyUserTaskFactory(
            assigned_to_user=test_company_user,
            assigned_to=test_admin_user,
            assigned_to_group=test_group,
            workflow=self.workflow,
            task_type=Task.TaskTypeChoice.CHANGES_REQUESTED.value
        )
        url = reverse('tasks-list-view')
        self.admin_user.groups.set([])
        self.admin_user.save()
        self.make_full_access_admin(admin_user=self.admin_user)
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(len(response.data['results']), 31)
