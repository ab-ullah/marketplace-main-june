import datetime
import unittest

from django.utils import timezone

from api.companies.models import Company
from api.employment_records.models import EmploymentRecord
from api.employment_records.services.employment_record_version_service import EmploymentRecordVersionHistory
from api.employment_records.tests.factories import EmploymentRecordFactory
from api.partners.tests.factories import UserFactory
from core.base_tests import BaseTestCase


@unittest.skip("To be refactored")
class EmploymentRecordHistoryUnitTestCase(BaseTestCase):
    def setUp(self) -> None:
        self.company = Company.objects.get(name='sidecar')
        self.create_countries()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)

    def test_history_retrieval(self):
        employment_record = EmploymentRecordFactory(company=self.company, created_at=datetime.datetime(2020, 10, 10, 10, 10, 10, 10, timezone.get_current_timezone()))
        date_after_creation = datetime.datetime(2020, 11, 10, 10, 10, 10, 10, timezone.get_current_timezone())
        history = EmploymentRecordVersionHistory(employment_record, date_after_creation)
        historical_record = history.get_instance()

        # Check that my only historical record matches the current state
        self.compare_records(employment_record, historical_record)
        previous_job_title = employment_record.job_title
        employment_record.job_title = "Hey this is my new job"
        employment_record.save()
        employment_record.refresh_from_db()

        # Compare that the updated state matches the last version, and that the previous one is still intact
        history = EmploymentRecordVersionHistory(employment_record, date_after_creation)
        history_2 = EmploymentRecordVersionHistory(employment_record, timezone.now())
        new_record = history_2.get_instance()
        historical_record = history.get_instance()
        self.compare_records(employment_record, new_record)
        self.assertEqual(historical_record.job_title, previous_job_title)

    def compare_records(self, employment_record, historical_record):
        self.assertEqual(employment_record.company, historical_record.company)
        self.assertEqual(employment_record.job_title, historical_record.job_title)
        self.assertEqual(employment_record.job_band, historical_record.job_band)
        self.assertEqual(employment_record.department, historical_record.department)
        self.assertEqual(employment_record.office_location, historical_record.office_location)
        self.assertEqual(employment_record.salary_currency, historical_record.salary_currency)
        self.assertEqual(employment_record.hire_date, historical_record.hire_date)
        self.assertEqual(employment_record.bonus, historical_record.bonus)
