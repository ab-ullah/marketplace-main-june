import csv
import json
import os
import unittest
import uuid
from io import StringIO
from unittest import mock

from django.core.files.uploadedfile import SimpleUploadedFile
import boto3
from django.apps import apps
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.applications.models import Application
from api.applications.tests.factories import ApplicationFactory
from api.backup.models import FundDocumentsBackup, FundBackup, DynamoFund
from api.backup.serializers import LasalleApplicationReport
from api.backup.tests.constants import SUPPORTING_DOCUMENT_CONTENT, KYC_DOCUMENT_CONTENT, TAX_DOCUMENT_CONTENT, \
    SIGNED_COMPANY_DOCUMENT_CONTENT, CERTIFICATE_CONTENT, SIGNED_POWER_OF_ATTORNEY_CONTENT, \
    SIGNED_FUND_DOCUMENT_CONTENT, FUND_CERTIFICATE_DOCUMENT_CONTENT, COMPANY_DOCUMENT_CONTENT, FUND_DOCUMENT_CONTENT
from api.backup.tests.test_backup_fund import CompleteApplication
from api.companies.models import CompanyDocument
from api.documents.models import FundInviteDocument, FundDocument
from api.eligibility_criteria.tests.factories import InvestmentAmountFactory
from api.employment_records.models import EmploymentRecord, Position
from api.funds.models import Fund, FundShareClass, LeverageOption
from api.geographics.models import Country
from api.investors.models import Investor, CompanyUserInvestor
from api.partners.tests.factories import UserFactory, FundFactory, CompanyUserFactory, CurrencyFactory, CompanyFactory, \
    CompanyUserInvestorFactory, CompanyFundVehicleFactory, ExternalOnboardingFactory, DocumentFilterFactory, \
    InvestorFactory, FundShareClassFactory, FundTagFactory, LeverageOptionFactory, DynamoFundFactory


class ImportOrgDataTestCase(APITestCase):

    def setUp(self) -> None:
        self.user = UserFactory()
        self.company = CompanyFactory()
        self.admin_user = CreateAdminUserService(email=self.user.email, company_name=self.company.name).create()
        self.company_user = CompanyUserFactory(user=self.user)
        self.company_user_invited_to_fund = CompanyUserFactory(user=self.user)
        self.client.force_authenticate(self.user)
        self.s3 = boto3.client("s3")
        # self.s3 = boto3.client("s3", endpoint_url="http://localhost:4566/")
        self.bucket_name = "investors-applications-backup"

    @staticmethod
    def get_invites_csv(name):
        with open(os.path.join(os.path.dirname(__file__), f'data/{name}.csv')) as _file:
            return SimpleUploadedFile.from_dict({
                "filename": _file.name,
                "content": _file.read().encode('utf-8'),
                "content-type": "text/csv"
            })

    def test_org_file_import(self):
        Investor.objects.all().delete()
        payload = {
            "notice_type": "organization_chart",
            "document_file": self.get_invites_csv('org_test'),

        }
        url = reverse('notice-create')
        response = self.client.post(
            url, data=payload,
            format="multipart"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EmploymentRecord.objects.count(), 2)
        self.assertEqual(Investor.objects.count(), 1)
        self.assertEqual(Position.objects.filter(company=self.company).count(), 2)

        manager_employee = EmploymentRecord.objects.filter(company=self.company, manager__isnull=True).first()
        self.assertEqual(manager_employee.participant_profile.user.email, 'davidmanager+test@hellosidecar.com')
        self.assertEqual(manager_employee.ein, '224466')
        self.assertIsNotNone(manager_employee)

        report_employee = EmploymentRecord.objects.filter(company=self.company, manager=manager_employee).first()
        self.assertEqual(report_employee.participant_profile.user.email, 'johnsmith+test@hellosidecar.com')
        self.assertEqual(report_employee.ein, '112233')
        self.assertIsNotNone(report_employee)

        investor = Investor.objects.get(partner_id='224466', investor_account_code='71506')
        self.assertTrue(
            CompanyUserInvestor.objects.filter(
                investor=investor,
                company_user__user_id=manager_employee.participant_profile.user_id
            )
        )
