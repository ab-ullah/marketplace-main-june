import unittest
from datetime import datetime, timedelta
from unittest import mock

from dateutil.relativedelta import relativedelta
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.reverse import reverse

from api.carry_pools.models import Deal, DealCarryPlan, CarryDocument, ParticipantCarryDocument

from api.carry_pools.serializers import CarryDocumentSerializer
from api.carry_pools.services.calculate_vested_points import CalculateVestedPointsService
from api.carry_pools.tests.factories import (AllocationAction,
                                             CarryPlanFactory,
                                             CarryPoolFactory,
                                             FundCarryPlanFactory,
                                             TimeBasedVestingScheduleFactory,
                                             VestingScheduleFactory, DealCarryPlanFactory, DealFactory,
                                             CarryParticipantFactory
                                             )
from api.carry_pools.utils import get_carry_pool_of_carry_plan
from api.partners.tests.factories import FundFactory
from core.base_tests import BaseTestCase

class HurdleCalculationAPITestCase(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.create_fund(company=self.company)
        self.carr_plan = None
        # self.vesting_schedule = self.create_vesting_schedule()
        # self.fraction_vesting_schedule = self.create_fraction_vesting_schedule()
        self.carry_participant = self.create_carry_participant()
        self.allocations = self._get_allocations()

    def create_carry_participant(self):
        carry_participant = CarryParticipantFactory(company=self.company)
        carry_participant.associate_with_user(self.user)
        return carry_participant

    def create_fund_carry_plan_with_allocation(self,
                                               vesting_start_date=None,
                                               points=None,
                                               vesting_schedule=None,
                                               allocation_vesting_start_date=None
                                               ):
        carry_plan_vesting_start_date = vesting_start_date if vesting_start_date else \
            datetime.now() - relativedelta(years=2, days=1)

        if not allocation_vesting_start_date:
            allocation_vesting_start_date = carry_plan_vesting_start_date

        self.carry_plan = CarryPlanFactory(company=self.company, effective_date=carry_plan_vesting_start_date)
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=self.carry_plan)
        CarryPoolFactory(carry_plan=self.carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": points if points else 40,
                    "allocation_id": None,
                    "grant_date": datetime.now(),
                    "vesting_schedule": vesting_schedule if vesting_schedule else self.vesting_schedule.id,
                    "vesting_start_date": allocation_vesting_start_date
                }
            ]}
        url = reverse('carry-plan-allocations', kwargs={'pk': self.carry_plan.id})

        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        return fund_carry_plan

    def _get_allocations(self):
        """Get allocations for the carry plan."""
        allocations_url = reverse('carry-plan-allocations', kwargs={'pk': self.carry_plan.id})
        # self.client.post(allocations_url, format='json', **self.get_headers())
        get_response = self.client.get(allocations_url)
        return get_response.data['allocations']

    def _get_payload(self):
        """Generate a payload for creating carry hurdles."""
        allocations = self._get_allocations()
        print("allocations")
        print(allocations)
        print("allocations")
        source_allocations_ids = [alloc['allocation_id'] for alloc in self.allocations[:2]]
        # impacted_allocations_ids = [alloc['allocation_id'] for alloc in self.allocations[2:4]]
        return {
            "hurdle_rate": "5.00",
            "is_supercharged": True,
            "impact_type": CarryHurdle.ImpactType.EVEN,
            "supercharge_end_value": "8.00",
            "source_allocations": source_allocations_ids,
            # "impacted_allocations": impacted_allocations_ids
        }

    def test_create_carry_hurdle(self):
        """Test creation of carry hurdles with multiple source allocations."""
        url = reverse('carry-hurdle-create', kwargs={'pk': self.carry_plan.id})
        payload = self._get_payload()
        # response = self.client.post(
        #     url,
        #     data=payload,
        #     format="json",
        #     **self.get_headers()
        #     )
        # self.assertEqual(response.status_code, status.HTTP_201_CREATED)













from decimal import Decimal

from rest_framework import status
from rest_framework.reverse import reverse

from api.carry_pools.models import CarryHurdle
from api.carry_pools.tests.factories import (
    CarryParticipantFactory,
    CarryPlanFactory,
    CarryPoolFactory,
    VestingScheduleFactory,
    )
from api.partners.tests.factories import UserFactory
from api.admin_users.models import AdminUser
from core.base_tests import BaseTestCase


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