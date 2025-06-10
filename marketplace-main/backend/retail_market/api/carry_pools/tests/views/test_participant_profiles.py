import unittest
from http import HTTPStatus

from django.urls import reverse
from rest_framework import status

from api.carry_pools.entities import Allocation
from api.carry_pools.models import CarryParticipant
from api.carry_pools.tests.factories import CarryPlanFactory, CarryPoolFactory, VestingScheduleFactory, \
    FundCarryPlanFactory, CarryParticipantFactory
from api.carry_pools.tests.views.base import CarryTestCase
from api.companies.models import Company
from api.employment_records.tests.factories import PositionFactory, CompanyRoleFactory, EmploymentRecordFactory, \
    DepartmentFactory, OfficeLocationFactory, JobBandFactory
from api.participants.models import ParticipantProfile


class ParticipantProfileTestCase(CarryTestCase):
    def setUp(self) -> None:
        self.company = Company.objects.get(name='sidecar')
        self.create_countries()
        self.create_user()
        self.carry_plan = CarryPlanFactory(company=self.company)
        self.carry_pool = CarryPoolFactory(carry_plan=self.carry_plan, company=self.company)
        self.fund_carry_plan = FundCarryPlanFactory(carry_plan=self.carry_plan)
        self.vesting_schedule = VestingScheduleFactory(
            is_default=True,
            company=self.company
        )
        self.client.force_authenticate(self.admin_user.user)
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)
        self.add_participants(
            self.carry_pool.external_id,
            [Allocation(bps=10, carry_participant_id=self.carry_participant.id)],
            carry_plan_id=self.carry_plan.id
        )

    def test_participants(self):
        url = reverse('participants')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data[0]['id'], self.user.id)

        url = reverse('participant', kwargs={'user_id': self.user.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data['id'], self.user.id)

    def test_participant_ein_number(self):
        url = reverse('manager-detail-level-api-view', kwargs={'carry_participant_id': self.carry_participant.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data['employment_record']['employee_id'], str(self.user.id))

        employment_record = EmploymentRecordFactory(
            company=self.company,
            job_band=None,
            department=None,
            office_location=None
        )
        participant_profile = ParticipantProfile.objects.first()
        participant_profile.employment_record = employment_record
        participant_profile.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data['employment_record']['employee_id'], str(employment_record.id))

        employment_record.ein = 'E9991'
        employment_record.save()

        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data['employment_record']['employee_id'], employment_record.ein)


    def test_title_in_participants(self):
        employment_record = EmploymentRecordFactory(
            company=self.company,
            job_band=None,
            department=None,
            office_location=None
        )
        company_role = CompanyRoleFactory(company=self.company, name='Director')
        positions = PositionFactory(functional_role=company_role, employment_record=employment_record, end_date=None,company=self.company)
        self.assertEqual(ParticipantProfile.objects.filter(user=self.user, company=self.company).count(), 1)
        participant_profile = ParticipantProfile.objects.first()
        participant_profile.employment_record=employment_record
        participant_profile.save()

        url = reverse('participants')
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data[0]['id'], self.user.id)
        self.assertEqual(response.data[0]['title'], 'Director')

    def test_retrieve_and_update_participant_profile(self):
        """Test retrieving and updating the participant profile in the same test"""
        url = reverse('participant-profile', kwargs={'pk': self.user.pk})
        employment_url = reverse('participant-employment-update', kwargs={'pk': self.user.pk})
        department = DepartmentFactory.create(company=self.company)
        office_location = OfficeLocationFactory.create(company=self.company)
        job_band = JobBandFactory.create(company=self.company)
        employment_record = EmploymentRecordFactory(
            company=self.company,
            department=department,
            office_location=office_location,
            job_band=job_band
        )
        department_2 = DepartmentFactory.create(company=self.company)
        office_location_2 = OfficeLocationFactory.create(company=self.company)
        job_band_2 = JobBandFactory.create(company=self.company)
        company_role = CompanyRoleFactory(company=self.company, name='Director')
        company_role_2 = CompanyRoleFactory(company=self.company, name='President')
        positions = PositionFactory(title=company_role, employment_record=employment_record, end_date=None, company=self.company)
        self.user.user_participant_profile.employment_record = employment_record
        self.user.user_participant_profile.save()
        # Step 2: Update participant profile
        update_data = {
            "user_first_name": "Jane",
            "user_last_name": "Smith",
            "carry_participants": [{
                "id": self.carry_participant.id,
                "entity": CarryParticipant.EntityType.INDIVIDUAL.value,
                "first_name": "Jane",
                "last_name": "Smith",
                "company": self.company.id
            }],
        }


        employment_update_data = {
            "job_band": job_band_2.id,
            "department": department_2.id,
            "office_location": office_location_2.id,
            "hire_date": "2020-05-01",
            "separation_date": None,
            "current_position_title": company_role_2.id,
            "current_position_annual_salary": "120000.00",
            "current_position_target_bonus": "15000.00",
            "current_position_start_date": "2020-06-01",
            "status": "Active"
        }

        update_response = self.client.patch(url, data=update_data, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        employment_update_response = self.client.patch(employment_url, data=employment_update_data, format='json')
        self.assertEqual(employment_update_response.status_code, status.HTTP_200_OK)

        # Step 3: Retrieve again to verify updates
        retrieve_after_update_response = self.client.get(url)
        self.assertEqual(retrieve_after_update_response.status_code, status.HTTP_200_OK)

        # Check updated user fields
        self.assertEqual(retrieve_after_update_response.data['user_first_name'], "Jane")
        self.assertEqual(retrieve_after_update_response.data['user_last_name'], "Smith")

        # Reload the user data
        self.user.refresh_from_db()

        # Check employment record was updated
        employment_record = self.user.user_participant_profile.employment_record
        self.assertEqual(employment_record.job_band_id, job_band_2.id)
        self.assertEqual(employment_record.department_id, department_2.id)
        self.assertEqual(employment_record.office_location_id, office_location_2.id)

        # Check position update
        current_position = employment_record.positions.filter(company=self.company, end_date__isnull=True).first()
        self.assertEqual(current_position.functional_role.id, company_role_2.id)
        self.assertEqual(current_position.annual_salary, "120000.0000")
        self.assertEqual(current_position.target_bonus, "15000.0000")

        # Check carry participant update
        carry_participant = CarryParticipant.objects.get(id=self.carry_participant.id)
        self.assertEqual(carry_participant.first_name, "Jane")
        self.assertEqual(carry_participant.last_name, "Smith")
