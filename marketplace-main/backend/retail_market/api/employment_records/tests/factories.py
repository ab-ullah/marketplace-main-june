import random

import factory
from factory import SubFactory
from faker import Faker
from _decimal import Decimal
from api.employment_records.models import EmploymentRecord, JobBand, Department, OfficeLocation, CompanyRole, Position
from api.partners.tests.factories import CompanyFactory

fake = Faker()


class JobBandFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: f"{fake.job()} {random.choices(['I', 'II', 'III', 'IV', 'V'])}")

    class Meta:
        model = JobBand


class DepartmentFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: fake.bs())

    class Meta:
        model = Department


class OfficeLocationFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: fake.city())

    class Meta:
        model = OfficeLocation


class CompanyRoleFactory(factory.django.DjangoModelFactory):
    name = factory.LazyAttribute(lambda x: fake.job())
    company = SubFactory(CompanyFactory)

    class Meta:
        model = CompanyRole


class EmploymentRecordFactory(factory.django.DjangoModelFactory):
    job_band = factory.SubFactory(JobBandFactory)
    department = factory.SubFactory(DepartmentFactory)
    office_location = factory.SubFactory(OfficeLocationFactory)
    company = SubFactory(CompanyFactory)

    class Meta:
        model = EmploymentRecord


class PositionFactory(factory.django.DjangoModelFactory):
    functional_role = factory.SubFactory(CompanyRoleFactory)
    start_date = factory.LazyAttribute(lambda x: fake.date_between(start_date='-5y', end_date='today'))
    end_date = factory.LazyAttribute(lambda x: random.choices(
        [fake.date_between(start_date=factory.SelfAttribute('start_date'), end_date='today'), None]
    ))
    annual_salary = factory.LazyAttribute(lambda x: Decimal(fake.random_number(digits=5, fix_len=True)))
    target_bonus = factory.LazyAttribute(lambda x: Decimal(fake.random_number(digits=4, fix_len=True)) if random.choice([True, False]) else None)
    employment_record = factory.SubFactory(EmploymentRecordFactory)

    class Meta:
        model = Position
