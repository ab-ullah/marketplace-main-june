import csv
import http
import random

from _decimal import Decimal
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from faker import Faker

from api.companies.models import CompanyUser
from api.employment_records.services.onboarding import EmployeeOnboardRow
from api.employment_records.admin_views.urls import UPLOAD_EMPLOYEES_ONBOARDING_FILE_NAME
from api.employment_records.tests.factories import JobBandFactory, DepartmentFactory, OfficeLocationFactory, \
    CompanyRoleFactory
from api.partners.tests.factories import CurrencyFactory
from api.users.models import RetailUser
from core.base_tests import BaseTestCase

INCOMPLETE_EMPLOYEES_ONBOARDING_FILE = 'incomplete_employees_onboarding.csv'
INVALID_VALUES_EMPLOYEES_ONBOARDING_FILE = 'invalid_values_employees_onboarding.csv'
VALID_EMPLOYEES_ONBOARDING_FILE = 'valid_employees_onboarding.csv'
fake = Faker()


def generate_fake_employee():
    d = {
        "Email": fake.email(),
        "First name": fake.first_name(),
        "Last name": fake.last_name(),
        "Job title": fake.job(),
        "Office location": fake.city(),
        "Department": fake.bs(),
        "Expected annual salary": Decimal(fake.random_number(digits=5, fix_len=True)),
        "Current role start date": fake.date_between(start_date='-3y', end_date='today'),
        "Hire date": fake.date_between(start_date='-10y', end_date='today'),
        "Job band": random.choice(['A', 'B', 'C', 'D', 'E'])
    }
    if random.choice([True, False]):
        d["Target bonus"] = Decimal(fake.random_number(digits=4, fix_len=True))
    return EmployeeOnboardRow.model_validate(d)


def generate_valid_fake_employee(job_titles, job_bands, departments, office_locations):
    d = generate_new_values_for(fake.email(), job_titles, job_bands, departments, office_locations)
    return EmployeeOnboardRow.model_validate(d)


def generate_new_values_for(email, job_titles, job_bands, departments, office_locations):
    d = {
        "Email": email,
        "First name": fake.first_name(),
        "Last name": fake.last_name(),
        "Job title": random.choices(job_titles)[0],
        "Office location": random.choices(office_locations)[0],
        "Department": random.choices(departments)[0],
        "Expected annual salary": Decimal(fake.random_number(digits=5, fix_len=True)),
        "Target bonus": Decimal(fake.random_number(digits=4, fix_len=True)) if random.choice([True, False]) else None,
        "Current role start date": fake.date_between(start_date='-3y', end_date='today'),
        "Hire date": fake.date_between(start_date='-10y', end_date='today'),
        "Job band": random.choice(job_bands)
    }
    if random.choice([True, False]):
        d["Target bonus"] = Decimal(fake.random_number(digits=4, fix_len=True))
    return EmployeeOnboardRow.model_validate(d)


class EmployeesOnboardingTestCase(BaseTestCase):
    def setUp(self) -> None:
        self.upload_url_name = UPLOAD_EMPLOYEES_ONBOARDING_FILE_NAME
        self.create_user()
        CurrencyFactory.create(company=self.company)
        self.client.force_authenticate(self.admin_user.user)
        self.job_bands = [JobBandFactory(company=self.company, name=f"Job band {i}").name for i in range(10)]
        self.departments = [DepartmentFactory(company=self.company, name=f"Department {i}").name for i in range(5)]
        self.office_locations = [OfficeLocationFactory(company=self.company, name=f"Office location {i}").name for i in range(10)]
        self.company_roles = [CompanyRoleFactory(company=self.company, name=f"Company role {i}").name for i in range(5)]

    def test_invalid_csv_file(self):
        with open(INCOMPLETE_EMPLOYEES_ONBOARDING_FILE, 'w', newline='') as csvfile:
            fieldnames = EmployeeOnboardRow.human_readable_titles()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            fake_employee = generate_fake_employee()
            dumped = fake_employee.model_dump(by_alias=True)
            dumped.pop('Current role start date')
            writer.writerow(dumped)
        url = reverse(self.upload_url_name)
        response = self.upload_onboarding_file(url, INCOMPLETE_EMPLOYEES_ONBOARDING_FILE)
        self.assertEqual(response.status_code, http.HTTPStatus.PRECONDITION_FAILED)
        content = response.json()
        self.assertEqual(content['message'], "Incomplete CSV file, contact support")

    def upload_onboarding_file(self, url, file_path):
        with open(file_path) as _file:
            file = SimpleUploadedFile.from_dict({
                "filename": _file.name,
                "content": _file.read().encode('utf-8'),
                "content-type": "text/csv"
            })
        payload = {
            "employees_onboarding_file": file,
        }
        response = self.client.post(
            url, data=payload,
            format="multipart"
        )
        return response

    def test_complete_valid_onboarding_from_scratch(self):
        employees = [generate_valid_fake_employee(job_titles=self.company_roles,
                                                  departments=self.departments,
                                                  office_locations=self.office_locations,
                                                  job_bands=self.job_bands) for _ in range(5)]
        employees_by_email = {employee.email: employee for employee in employees}
        response = self.upload_valid_employees(employees)
        self.assertEqual(response.status_code, http.HTTPStatus.OK)

        users_qs = RetailUser.objects.filter(email__in=employees_by_email.keys())
        self.assertEqual(CompanyUser.objects.filter(company=self.company).count() - 1, users_qs.count())
        users_qs_related = users_qs.select_related('user_participant_profile__employment_record').prefetch_related(
            'user_participant_profile__employment_record__positions')
        for user in users_qs_related:
            self.assert_employee(employees_by_email, user)

    def assert_employee(self, employees_by_email, user):
        employment_record = user.user_participant_profile.employment_record
        self.assertEqual(employment_record.positions.count(), 1)
        role = employment_record.positions.first()
        self.assertEqual(employment_record.job_band.name, employees_by_email[user.email].job_band)
        self.assertEqual(employment_record.department.name, employees_by_email[user.email].department)
        self.assertEqual(employment_record.office_location.name, employees_by_email[user.email].office_location)
        self.assertEqual(employment_record.hire_date.date(), employees_by_email[user.email].hire_date)
        self.assertEqual(role.start_date.date(), employees_by_email[user.email].role_start_date)
        self.assertIsNone(role.end_date)
        self.assertEqual(Decimal(role.annual_salary), employees_by_email[user.email].annual_salary)
        self.assertEqual(user.first_name, employees_by_email[user.email].first_name)
        self.assertEqual(user.last_name, employees_by_email[user.email].last_name)

    def upload_valid_employees(self, employees):
        with open(VALID_EMPLOYEES_ONBOARDING_FILE, 'w', newline='') as csvfile:
            fieldnames = EmployeeOnboardRow.human_readable_titles()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for employee in employees:
                writer.writerow(employee.model_dump(by_alias=True))
        url = reverse(self.upload_url_name)
        response = self.upload_onboarding_file(url, VALID_EMPLOYEES_ONBOARDING_FILE)
        return response

    def test_already_created_csv_file(self):
        employees = [generate_valid_fake_employee(job_titles=self.company_roles,
                                                  departments=self.departments,
                                                  office_locations=self.office_locations,
                                                  job_bands=self.job_bands) for _ in range(5)]
        self.upload_valid_employees(employees)

        employees = [generate_new_values_for(email=employee.email,
                                             job_titles=self.company_roles,
                                             departments=self.departments,
                                             office_locations=self.office_locations,
                                             job_bands=self.job_bands) for employee in employees]

        new_and_old_employees = [generate_valid_fake_employee(job_titles=self.company_roles,
                                                              departments=self.departments,
                                                              office_locations=self.office_locations,
                                                              job_bands=self.job_bands) for _ in range(5)] + employees
        new_and_old_employees_by_email = {employee.email: employee for employee in new_and_old_employees}
        response = self.upload_valid_employees(new_and_old_employees)
        self.assertEqual(response.status_code, http.HTTPStatus.OK)

        users_qs = RetailUser.objects.filter(email__in=new_and_old_employees_by_email.keys())
        self.assertEqual(CompanyUser.objects.filter(company=self.company).count() - 1, users_qs.count())
        users_qs_related = users_qs.select_related('user_participant_profile__employment_record').prefetch_related(
            'user_participant_profile__employment_record__positions')
        for user in users_qs_related:
            self.assert_employee(new_and_old_employees_by_email, user)
