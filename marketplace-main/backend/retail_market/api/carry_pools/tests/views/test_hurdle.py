from datetime import datetime
from decimal import Decimal

from django.core.management import call_command
from django.utils import timezone

from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.models import AdminUser
from api.carry_pools.models import CarryHurdle
from api.carry_pools.services.user_carry_allocation_service import UserCarryAllocationService
from api.carry_pools.tests.factories import (
    CarryParticipantFactory,
    CarryPlanFactory,
    CarryPoolFactory,
    FundCarryPlanFactory,
    TimeBasedVestingScheduleFactory,
    VestingScheduleFactory,
)
from api.partners.tests.factories import UserFactory

from core.base_tests import BaseTestCase


class HurdleCalculationAPITestCase(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.create_fund(company=self.company)
        call_command('activate_company_feature_flag', f'{self.company.id}', 'carry_hurdle')
        self.carry_participant = self.create_carry_participant()
        self.vesting_schedule = self.create_vesting_schedule()
        self.fund_carry_plan = self.create_fund_carry_plan_with_allocation()
        self.allocations = self.get_allocations()

    def create_carry_participant(self):
        carry_participant = CarryParticipantFactory(company=self.company)
        carry_participant.associate_with_user(self.user)
        return carry_participant

    def create_vesting_schedule(self):
        vesting_schedule = VestingScheduleFactory(**{
            'name': 'Time Based Vesting Schedule for Testing',
            'description': '4 year vesting, 1 year cliff - vests 25% after 12 months '
                           'then equal parts yearly i.e. 25% until 100% vested',
            'vesting_type': 1,
            'is_default': True,
            'cliff_duration': 'P1Y',
            'cliff_vesting_percentage': 25,
            'cliff_vesting_percentage_numerator': 25,
            'cliff_vesting_percentage_denominator': 1,
            'company': self.company
        })
        for sequence in range(1, 4):
            TimeBasedVestingScheduleFactory(**{
                'vesting_schedule': vesting_schedule,
                'period_duration': 'P1Y',
                'period_vesting_percentage': 25,
                'period_vesting_percentage_numerator': 25,
                'period_vesting_percentage_denominator': 1,
                'sequence': sequence
            })
        return vesting_schedule

    def create_fund_carry_plan_with_allocation(self):
        carry_plan = CarryPlanFactory(company=self.company, effective_date=datetime.now())
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 50,
                    "allocation_id": None,
                    "grant_date": datetime.now(),
                    "vesting_schedule": self.vesting_schedule.id,
                    "vesting_start_date": datetime.now()
                }
            ]}
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})
        self.client.post(url, data=payload, format='json', **self.get_headers())
        return fund_carry_plan

    def get_allocations(self):
        url = reverse('carry-plan-allocations', kwargs={'pk': self.fund_carry_plan.carry_plan.id})
        return self.client.get(url).data['allocations']

    def get_payload(self, hurdle_rate):
        return {
            "supercharge_end_value": "",
            "impact_type": CarryHurdle.ImpactType.PRO_RATA,
            "applies_to": CarryHurdle.AppliesToType.ECV,
            "is_supercharged": False,
            "source_allocations": [self.allocations[0]['allocation_id']],
            "impacted_allocations": [],
            "hurdle_rate": hurdle_rate
        }

    def post_hurdle_and_get_allocation(self, hurdle_rate):
        url = reverse('carry-hurdle-create', kwargs={'pk': self.fund_carry_plan.carry_plan.id})
        payload = self.get_payload(hurdle_rate)
        response = self.client.post(url, data=payload, format="json", **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation_url = reverse(
            'carry-plan-single-allocation',
            kwargs={
                'pk': self.fund_carry_plan.carry_plan.id,
                'allocation_id': payload['source_allocations'][0]
            }
        )
        alloc_response = self.client.get(allocation_url, format="json", **self.get_headers())
        self.assertEqual(alloc_response.status_code, status.HTTP_200_OK)
        return alloc_response.data

    def test_ecv_greater_than_hurdle_rate(self):
        data = self.post_hurdle_and_get_allocation(hurdle_rate=3000)
        self.assertEqual(Decimal(data["participant_ecv"]), Decimal(3500))

    def test_ecv_less_than_hurdle_rate(self):
        data = self.post_hurdle_and_get_allocation(hurdle_rate=12000)
        self.assertEqual(Decimal(data["participant_ecv"]), Decimal(0))


class CarryHurdleListCreateAPITestCase(BaseTestCase):
    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        AdminUser.objects.create(user=self.user, company=self.company)

        self.vesting_schedule = VestingScheduleFactory(is_default=True, company=self.company)
        self.carry_plan = CarryPlanFactory(
            company=self.company,
            default_vesting_schedule=self.vesting_schedule
        )
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)
        self.url = reverse('carry-hurdle-create', kwargs={'pk': self.carry_plan.id})
        self.allocations = self._get_allocations()

    def _get_allocations(self):
        """Generate allocations for the carry plan."""
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 40,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 30,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 20,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 10,
                    "allocation_id": None
                }
            ]}
        allocations_url = reverse('carry-plan-allocations', kwargs={'pk': self.carry_plan.id})
        self.client.post(allocations_url, data=payload, format='json', **self.get_headers())
        get_response = self.client.get(allocations_url)
        return get_response.data['allocations']

    def _get_payload(self):
        """Generate a payload for creating carry hurdles."""
        source_allocations_ids = [alloc['allocation_id'] for alloc in self.allocations[:2]]
        impacted_allocations_ids = [alloc['allocation_id'] for alloc in self.allocations[2:4]]
        return {
            "hurdle_rate": "5.00",
            "is_supercharged": True,
            "impact_type": CarryHurdle.ImpactType.EVEN,
            "supercharge_end_value": "8.00",
            "source_allocations": source_allocations_ids,
            "impacted_allocations": impacted_allocations_ids
        }

    def test_list_carry_hurdles_empty(self):
        """Ensure empty list is returned when no carry hurdles exist."""
        response = self.client.get(self.url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_create_carry_hurdle(self):
        """Test creation of carry hurdles with multiple source allocations."""
        payload = self._get_payload()
        response = self.client.post(
            self.url,
            data=payload,
            format="json",
            **self.get_headers()
            )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(CarryHurdle.objects.count(), 2)
        hurdle = CarryHurdle.objects.first()

        self.assertEqual(hurdle.carry_plan, self.carry_plan)
        self.assertEqual(hurdle.hurdle_rate, Decimal(payload["hurdle_rate"]))
        self.assertEqual(hurdle.is_supercharged, payload["is_supercharged"])
        self.assertEqual(hurdle.impact_type, payload["impact_type"])
        self.assertEqual(hurdle.supercharge_end_value, Decimal(payload["supercharge_end_value"]))
        self.assertListEqual(hurdle.impacted_allocations_ids, payload["impacted_allocations"])

    def test_list_carry_hurdles(self):
        """Test list endpoint returns created carry hurdles."""
        payload = self._get_payload()
        self.client.post(
            self.url,
            data=payload,
            format="json",
            **self.get_headers()
            )

        response = self.client.get(self.url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)