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


class VestingCalculationAPITestCase(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.client.force_authenticate(self.admin_user.user)
        self.create_fund(company=self.company)
        self.vesting_schedule = self.create_vesting_schedule()
        self.fraction_vesting_schedule = self.create_fraction_vesting_schedule()
        self.carry_participant = self.create_carry_participant()

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

        sequence = 1
        for count in range(1, 4):
            TimeBasedVestingScheduleFactory(**{
                'vesting_schedule': vesting_schedule,
                'period_duration': 'P1Y',
                'period_vesting_percentage': 25,
                'period_vesting_percentage_numerator': 25,
                'period_vesting_percentage_denominator': 1,
                'sequence': sequence
            })
            sequence += 1

        return vesting_schedule

    def create_fraction_vesting_schedule(self):
        vesting_schedule = VestingScheduleFactory(**{
            'name': 'Uneven Fraction Vesting Schedule',
            'description': '3 year vesting, 1 year cliff of 33.3333% - '
                           'then equal parts yearly i.e. 33.3333% until 100% vested',
            'vesting_type': 1,
            'is_default': False,
            'cliff_duration': 'P1Y',
            'cliff_vesting_percentage': 33.3333,
            'cliff_vesting_percentage_numerator': 100,
            'cliff_vesting_percentage_denominator': 3,
            'company': self.company
        })

        sequence = 1
        for count in range(1, 3):
            TimeBasedVestingScheduleFactory(**{
                'vesting_schedule': vesting_schedule,
                'period_duration': 'P1Y',
                'period_vesting_percentage': 33.3333,
                'period_vesting_percentage_numerator': 100,
                'period_vesting_percentage_denominator': 3,
                'sequence': sequence
            })
            sequence += 1

        return vesting_schedule

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

        carry_plan = CarryPlanFactory(company=self.company, effective_date=carry_plan_vesting_start_date)
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

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
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        return fund_carry_plan

    def create_fund_carry_plan_with_multiple_allocation(self):
        carry_plan = CarryPlanFactory(company=self.company)
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 50,
                    "allocation_id": None,
                    "grant_date": datetime.now()
                },
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 40,
                    "allocation_id": None,
                    "grant_date": datetime.now()
                }
            ],
            "mode": "add"
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        return fund_carry_plan

    def create_deal_carry_plan_with_allocation(self):
        carry_plan_vesting_start_date = datetime.now() - relativedelta(years=2, days=1)
        carry_plan = CarryPlanFactory(company=self.company, effective_date=carry_plan_vesting_start_date)
        self.deal = Deal.objects.create(name="Deal 22 Nov", estimated_value=6900, company=self.company)
        deal_carry_plan = DealCarryPlan.objects.create(deal=self.deal, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 30,
                    "allocation_id": None,
                    "grant_date": datetime.now()
                }
            ]}
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        return deal_carry_plan

    def create_carry_document(self, carry_plan_ids=None):
        document_file = SimpleUploadedFile(
            name='test_file.txt',
            content=b'Sample content for testing',
            content_type='text/plain'
        )

        self.carry_document_request_data = {
            'document_file': document_file,
            'name': 'Test Carry Award Document',
            'description': 'Sample description',
            'show_everytime': True,
            'require_signature': True,
            'document_type': CarryDocument.DocumentType.CARRY_FORFEITURE.value
        }
        if carry_plan_ids:
            self.carry_document_request_data['carry_plans'] = str(carry_plan_ids)
        context = {'company': self.company, 'admin_user': self.admin_user}
        serializer = CarryDocumentSerializer(data=self.carry_document_request_data, context=context)
        if serializer.is_valid():
            return serializer.save()

    def add_allocation_in_carry_plan(self, carry_plan):
        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 40,
                    "allocation_id": None,
                    "grant_date": datetime.now() - relativedelta(years=2, days=1)
                }
            ],
            "mode": "add"
        }
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

    def test_forfeit_from_unvested_bps(self):
        """
        Test that verifies that forfeiting the allocation, reduces the allocation's bps.
        """
        fund_carry_plan = self.create_fund_carry_plan_with_allocation()
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, fund_carry_plan.carry_plan.company_id)
        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], fund_carry_plan.carry_plan.name)
        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], 20)
        self.assertEqual(result_allocation['forfeited_bps'], 0)

        allocation_action = AllocationAction.objects.filter(
            allocation_id=carry_pool.allocations[0]['allocation_id'],
            type=AllocationAction.Type.FORFEIT.value
        )
        self.assertEqual(allocation_action.exists(), False)

        request_data = [
            {
                "allocation_id": carry_pool.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool.external_id,
                "base_pool_id": carry_pool.external_id,
                "bps": 8
            }
        ]

        response = self.client.post(forfeit_url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation = response.data[0]
        self.assertEqual(allocation['initial_bps'], 40)
        self.assertEqual(allocation['bps'], '32')
        self.assertEqual(allocation['vested_bps'], 20)
        self.assertEqual(allocation['forfeited_bps'], 8)

        allocation_action = AllocationAction.objects.filter(
            allocation_id=allocation['allocation_id'],
            type=AllocationAction.Type.FORFEIT.value
        )
        self.assertEqual(allocation_action.exists(), True)

    def test_forfeit_from_unvested_bps_deals(self):
        """
        Test that verifies that forfeiting the allocation, reduces the allocation's bps.
        (If carry plan is created against a deal)
        """
        deal_carry_plan = self.create_deal_carry_plan_with_allocation()
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_pool_from_deal = get_carry_pool_of_carry_plan(deal_carry_plan.carry_plan.id,
                                                            deal_carry_plan.carry_plan.company_id)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], deal_carry_plan.carry_plan.name)
        self.assertEqual(result_allocation['bps'], '30')
        self.assertEqual(result_allocation['vested_bps'], 15)
        self.assertEqual(result_allocation['forfeited_bps'], 0)
        self.assertEqual(result_allocation['carry_plan_estimated_value'], deal_carry_plan.deal.estimated_value)

        allocation_action_for_deal = AllocationAction.objects.filter(
            allocation_id=carry_pool_from_deal.allocations[0]['allocation_id'],
            type=AllocationAction.Type.FORFEIT.value
        )
        self.assertEqual(allocation_action_for_deal.exists(), False)

        request_data_for_deal = [
            {
                "allocation_id": carry_pool_from_deal.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool_from_deal.external_id,
                "base_pool_id": carry_pool_from_deal.external_id,
                "bps": 10
            }
        ]

        response = self.client.post(forfeit_url, data=request_data_for_deal, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation = response.data[0]
        self.assertEqual(allocation['initial_bps'], 30)
        self.assertEqual(allocation['bps'], '20')
        self.assertEqual(allocation['vested_bps'], 15)
        self.assertEqual(allocation['forfeited_bps'], 10)

        allocation_action = AllocationAction.objects.filter(
            allocation_id=allocation['allocation_id'],
            type=AllocationAction.Type.FORFEIT.value
        )
        self.assertEqual(allocation_action.exists(), True)

    def test_forfeit_from_vested_bps(self):
        """
        Test that verifies that when an allocation is forfeited, the forfeited points are initially
        deducted from the unvested BPS and the remaining BPS are deducted from the vested BPS.
        """
        fund_carry_plan = self.create_fund_carry_plan_with_allocation()
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, fund_carry_plan.carry_plan.company_id)
        result_allocation = response.data[0]

        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], 20)
        self.assertEqual(result_allocation['forfeited_bps'], 0)

        allocation_action = AllocationAction.objects.filter(
            allocation_id=carry_pool.allocations[0]['allocation_id'],
            type=AllocationAction.Type.FORFEIT.value
        )
        self.assertEqual(allocation_action.exists(), False)

        request_data = [
            {
                "allocation_id": carry_pool.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool.external_id,
                "base_pool_id": carry_pool.external_id,
                "bps": 30
            }
        ]

        response = self.client.post(forfeit_url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation = response.data[0]
        self.assertEqual(allocation['initial_bps'], 40)
        self.assertEqual(allocation['bps'], '10')
        self.assertEqual(allocation['vested_bps'], 10)
        self.assertEqual(allocation['forfeited_bps'], 30)

        allocation_action = AllocationAction.objects.filter(
            allocation_id=allocation['allocation_id'],
            type=AllocationAction.Type.FORFEIT.value
        )
        self.assertEqual(allocation_action.exists(), True)

    def test_forfeit_from_vested_bps_deals(self):
        """
        Test that verifies that when an allocation is forfeited, the forfeited points are initially
        deducted from the unvested BPS and the remaining BPS are deducted from the vested BPS.
        (if carry plan is created against a deal)
        """
        deal_carry_plan = self.create_deal_carry_plan_with_allocation()

        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_pool_from_deal = get_carry_pool_of_carry_plan(deal_carry_plan.carry_plan.id,
                                                            deal_carry_plan.carry_plan.company_id)

        result_allocation = response.data[0]

        self.assertEqual(result_allocation['bps'], '30')
        self.assertEqual(result_allocation['vested_bps'], 15)
        self.assertEqual(result_allocation['forfeited_bps'], 0)

        allocation_action = AllocationAction.objects.filter(
            allocation_id=carry_pool_from_deal.allocations[0]['allocation_id'],
            type=AllocationAction.Type.FORFEIT.value
        )
        self.assertEqual(allocation_action.exists(), False)

        request_data_for_deal = [
            {
                "allocation_id": carry_pool_from_deal.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool_from_deal.external_id,
                "base_pool_id": carry_pool_from_deal.external_id,
                "bps": 20
            }
        ]

        response = self.client.post(forfeit_url, data=request_data_for_deal, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation = response.data[0]
        self.assertEqual(allocation['initial_bps'], 30)
        self.assertEqual(allocation['bps'], '10')
        self.assertEqual(allocation['vested_bps'], 10)
        self.assertEqual(allocation['forfeited_bps'], 20)

        allocation_action = AllocationAction.objects.filter(
            allocation_id=allocation['allocation_id'],
            type=AllocationAction.Type.FORFEIT.value
        )
        self.assertEqual(allocation_action.exists(), True)

    def test_forfeit_all_unvested_bps(self):
        """
        Test to verify that no further vesting is done in later years if the all the unvested bps are forfeited.
        """
        fund_carry_plan = self.create_fund_carry_plan_with_allocation()
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, fund_carry_plan.carry_plan.company_id)
        request_data = [
            {
                "allocation_id": carry_pool.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool.external_id,
                "base_pool_id": carry_pool.external_id,
                "bps": 25
            }
        ]
        response = self.client.post(forfeit_url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation = response.data[0]

        # Forfeit 25 bps after two year vesting
        self.assertEqual(allocation['initial_bps'], 40)
        self.assertEqual(allocation['bps'], '15')
        self.assertEqual(allocation['vested_bps'], 15)
        self.assertEqual(allocation['forfeited_bps'], 25)

        # Assert vested bps after 3rd year are 15
        third_year_date = datetime.now() + relativedelta(years=1)
        result = CalculateVestedPointsService({
            'company_id': self.company.id,
            'base_pool_id': carry_pool.external_id,
            'parent_pool_id': carry_pool.external_id,
            'allocation_id': allocation['allocation_id'],
            'vesting_calculation_date': third_year_date.strftime('%Y-%m-%d'),
            'allocation': allocation
        }).calculate_vested_points()
        self.assertEqual(float(result['vested_points']), 15)

        # Assert vested bps after 4th year are 15
        fourth_year_date = datetime.now() + relativedelta(years=2)
        result = CalculateVestedPointsService({
            'company_id': self.company.id,
            'base_pool_id': carry_pool.external_id,
            'parent_pool_id': carry_pool.external_id,
            'allocation_id': allocation['allocation_id'],
            'vesting_calculation_date': fourth_year_date.strftime('%Y-%m-%d'),
            'allocation': allocation
        }).calculate_vested_points()
        self.assertEqual(float(result['vested_points']), 15)

    def test_forfeit_all_unvested_bps_deals(self):
        """
        Test to verify that no further vesting is done in later years if the all the unvested bps are forfeited.
        (if carry plan is created against a deal)
        """
        deal_carry_plan = self.create_deal_carry_plan_with_allocation()

        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_pool_from_deal = get_carry_pool_of_carry_plan(deal_carry_plan.carry_plan.id,
                                                            deal_carry_plan.carry_plan.company_id)

        request_data_deal = [
            {
                "allocation_id": carry_pool_from_deal.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool_from_deal.external_id,
                "base_pool_id": carry_pool_from_deal.external_id,
                "bps": 17
            }
        ]
        response = self.client.post(forfeit_url, data=request_data_deal, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation = response.data[0]

        # Forfeit 17 bps after two year vesting
        self.assertEqual(allocation['initial_bps'], 30)
        self.assertEqual(allocation['bps'], '13')
        self.assertEqual(allocation['vested_bps'], 13)
        self.assertEqual(allocation['forfeited_bps'], 17)

        # Assert vested bps after 3rd year are 13
        third_year_date = datetime.now() + relativedelta(years=1)
        result = CalculateVestedPointsService({
            'company_id': self.company.id,
            'base_pool_id': carry_pool_from_deal.external_id,
            'parent_pool_id': carry_pool_from_deal.external_id,
            'allocation_id': allocation['allocation_id'],
            'vesting_calculation_date': third_year_date.strftime('%Y-%m-%d'),
            'allocation': allocation
        }).calculate_vested_points()
        self.assertEqual(float(result['vested_points']), 13)

        # Assert vested bps after 4th year are 13
        fourth_year_date = datetime.now() + relativedelta(years=2)
        result = CalculateVestedPointsService({
            'company_id': self.company.id,
            'base_pool_id': carry_pool_from_deal.external_id,
            'parent_pool_id': carry_pool_from_deal.external_id,
            'allocation_id': allocation['allocation_id'],
            'vesting_calculation_date': fourth_year_date.strftime('%Y-%m-%d'),
            'allocation': allocation
        }).calculate_vested_points()
        self.assertEqual(float(result['vested_points']), 13)

    def test_forfeit_allocations_and_vest(self):
        """
        Test to verify that further vesting is done as expected in later years after forfeiting bps.
        """
        fund_carry_plan = self.create_fund_carry_plan_with_allocation()
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, fund_carry_plan.carry_plan.company_id)
        request_data = [
            {
                "allocation_id": carry_pool.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool.external_id,
                "base_pool_id": carry_pool.external_id,
                "bps": 4
            }
        ]
        response = self.client.post(forfeit_url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation = response.data[0]

        # Forfeit 4 bps after two year vesting
        self.assertEqual(allocation['initial_bps'], 40)
        self.assertEqual(allocation['bps'], '36')
        self.assertEqual(allocation['vested_bps'], 20)
        self.assertEqual(allocation['forfeited_bps'], 4)

        # Assert vested bps after 3rd year are 29
        third_year_date = datetime.now() + relativedelta(years=1)
        result = CalculateVestedPointsService({
            'company_id': self.company.id,
            'base_pool_id': carry_pool.external_id,
            'parent_pool_id': carry_pool.external_id,
            'allocation_id': allocation['allocation_id'],
            'vesting_calculation_date': third_year_date.strftime('%Y-%m-%d'),
            'allocation': allocation
        }).calculate_vested_points()
        self.assertEqual(float(result['vested_points']), 29)

        allocation['vested_bps'] = result['vested_points']

        # Assert vested bps after 4th year are 36
        fourth_year_date = datetime.now() + relativedelta(years=2, days=1)
        result = CalculateVestedPointsService({
            'company_id': self.company.id,
            'base_pool_id': carry_pool.external_id,
            'parent_pool_id': carry_pool.external_id,
            'allocation_id': allocation['allocation_id'],
            'vesting_calculation_date': fourth_year_date.strftime('%Y-%m-%d'),
            'allocation': allocation
        }).calculate_vested_points()
        self.assertEqual(float(result['vested_points']), 36)

    def test_forfeit_allocations_and_vest_deals(self):
        """
        Test to verify that further vesting is done as expected in later years after forfeiting bps.
        (if carry plan is created against a deal)
        """
        deal_carry_plan = self.create_deal_carry_plan_with_allocation()

        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        carry_pool_from_deal = get_carry_pool_of_carry_plan(deal_carry_plan.carry_plan.id,
                                                            deal_carry_plan.carry_plan.company_id)

        request_data_for_deal = [
            {
                "allocation_id": carry_pool_from_deal.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool_from_deal.external_id,
                "base_pool_id": carry_pool_from_deal.external_id,
                "bps": 3
            }
        ]
        response = self.client.post(forfeit_url, data=request_data_for_deal, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation = response.data[0]

        # Forfeit 3 bps after two year vesting
        self.assertEqual(allocation['initial_bps'], 30)
        self.assertEqual(allocation['bps'], '27')
        self.assertEqual(allocation['vested_bps'], 15)
        self.assertEqual(allocation['forfeited_bps'], 3)

        # Assert vested bps after 3rd year are 21.75
        third_year_date = datetime.now() + relativedelta(years=1)
        result = CalculateVestedPointsService({
            'company_id': self.company.id,
            'base_pool_id': carry_pool_from_deal.external_id,
            'parent_pool_id': carry_pool_from_deal.external_id,
            'allocation_id': allocation['allocation_id'],
            'vesting_calculation_date': third_year_date.strftime('%Y-%m-%d'),
            'allocation': allocation
        }).calculate_vested_points()
        self.assertEqual(float(result['vested_points']), 21.75)

        allocation['vested_bps'] = result['vested_points']

        # Assert vested bps after 4th year are 27
        # Check through Calculation API
        fourth_year_date = datetime.now() + relativedelta(years=2, days=1)
        url = reverse('calculate-vested-points')
        data = {
            'company_id': self.company.id,
            'base_pool_id': carry_pool_from_deal.external_id,
            'parent_pool_id': carry_pool_from_deal.external_id,
            'allocation_id': allocation['allocation_id'],
            'vesting_calculation_date': fourth_year_date.strftime('%Y-%m-%d'),
            'allocation': allocation
        }
        response = self.client.post(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data
        self.assertEqual(float(result['vested_points']), 27)

    def test_forfeit_allocations_by_as_of_date(self):
        """
        Test to verify that vesting is fine if given calculation as of date manually
        """
        fund_carry_plan = self.create_fund_carry_plan_with_allocation(datetime.now())
        carry_plan = fund_carry_plan.carry_plan
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})

        as_of_date = datetime.now().strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], carry_plan.name)
        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], 0)
        self.assertEqual(result_allocation['forfeited_bps'], 0)

        as_of_date = (datetime.now() + relativedelta(years=1, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], carry_plan.name)
        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], 10)
        self.assertEqual(result_allocation['forfeited_bps'], 0)

        as_of_date = (datetime.now() + relativedelta(years=2, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], carry_plan.name)
        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], 20)
        self.assertEqual(result_allocation['forfeited_bps'], 0)

        as_of_date = (datetime.now() + relativedelta(years=3, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], carry_plan.name)
        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], 30)
        self.assertEqual(result_allocation['forfeited_bps'], 0)

        as_of_date = (datetime.now() + relativedelta(years=5, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], carry_plan.name)
        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], 40)
        self.assertEqual(result_allocation['forfeited_bps'], 0)

        # do a forfeiture for 2 years from now and validate
        carry_pool = get_carry_pool_of_carry_plan(
            fund_carry_plan.carry_plan.id,
            fund_carry_plan.carry_plan.company_id
        )
        request_data = [
            {
                "allocation_id": carry_pool.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool.external_id,
                "base_pool_id": carry_pool.external_id,
                "bps": 8
            }
        ]
        as_of_date = (datetime.now() + relativedelta(years=2)).strftime('%Y-%m-%d')
        response = self.client.post(forfeit_url, HTTP_AS_OF_DATE=as_of_date, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        as_of_date = (datetime.now() + relativedelta(years=2, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], carry_plan.name)
        self.assertEqual(float(result_allocation['bps']), 32)
        self.assertEqual(result_allocation['vested_bps'], 20)
        self.assertEqual(result_allocation['forfeited_bps'], 8)

        # validate after effects of forfeiture in 3rd year
        as_of_date = (datetime.now() + relativedelta(years=3, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], carry_plan.name)
        self.assertEqual(float(result_allocation['bps']), 32)
        self.assertEqual(result_allocation['vested_bps'], 28)
        self.assertEqual(result_allocation['forfeited_bps'], 8)

        # validate after effects of forfeiture in 4th year
        as_of_date = (datetime.now() + relativedelta(years=4, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_name'], carry_plan.name)
        self.assertEqual(float(result_allocation['bps']), 32)
        self.assertEqual(result_allocation['vested_bps'], 32)
        self.assertEqual(result_allocation['forfeited_bps'], 8)

    def test_deal_allocations_by_date(self):
        """
        Test to verify deal allocations fetch endpoint with calculation date
        """
        deal_carry_plan = self.create_deal_carry_plan_with_allocation()
        carry_pool = get_carry_pool_of_carry_plan(
            deal_carry_plan.carry_plan.id,
            deal_carry_plan.carry_plan.company_id
        )

        as_of_date = (datetime.now() + relativedelta(years=1, days=1)).strftime('%Y-%m-%d')
        url = reverse('deal-allocations', kwargs={'pk': self.deal.id})
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data['deal']['name'], self.deal.name)
        self.assertEqual(data['total_points'], carry_pool.bps)
        self.assertEqual(data['participants'][0]['vested_bps'], 22.5)


    def test_vested_bps_by_as_of_date(self):
        """
        Test to verify that vesting decimals are fine if given calculation as of date manually
        """
        self.create_fund_carry_plan_with_allocation(datetime.now(), 10)
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})

        as_of_date = datetime.now().strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['bps'], '10')
        self.assertEqual(result_allocation['vested_bps'], 0)
        self.assertEqual(result_allocation['carry_pool_points'], 100)

        as_of_date = (datetime.now() + relativedelta(years=5, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['bps'], '10')
        self.assertEqual(result_allocation['vested_bps'], 10.0)
        self.assertEqual(result_allocation['carry_pool_points'], 100)

    def test_vesting_for_multiple_user_allocations(self):
        """
        Test to verify that vesting is done separately for each allocation for same user
        """
        fund_carry_plan = self.create_fund_carry_plan_with_multiple_allocation()
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})

        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, fund_carry_plan.carry_plan.company_id)
        allocation1 = carry_pool.allocations[0]
        allocation2 = carry_pool.allocations[1]
        self.assertEqual(allocation1['bps'], '50')
        self.assertEqual(allocation2['bps'], '40')
        self.assertEqual(allocation2['carry_participant_id'], allocation1['carry_participant_id'])

        as_of_date = (datetime.now() + relativedelta(years=2, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation1 = response.data[0]
        result_allocation2 = response.data[1]
        self.assertEqual(result_allocation1['vested_bps'], 25)
        self.assertEqual(result_allocation2['vested_bps'], 20)

    def test_carry_plan_estimated_value(self):
        """
        Test to verify estimated value and fair market value for carry plan
        Estimated Value should be sum of all related funds/deals
        """
        fund_carry_plan = self.create_fund_carry_plan_with_allocation(datetime.now(), 10)
        carry_plan = fund_carry_plan.carry_plan
        self.fund.estimated_value = 2500
        self.fund.fair_market_value = 2600
        self.fund.save()

        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # verify estimated value and fair market value is coming from fund
        result_allocation = response.data[0]
        self.assertEqual(self.fund.carry_estimated_value, 2500)
        self.assertEqual(self.fund.fair_market_value, 2600)
        self.assertEqual(result_allocation['carry_plan_estimated_value'], 2500)
        self.assertEqual(result_allocation['carry_plan_fair_market_value'], 2600)

        # verify estimated value and fair market value is coming from deal
        Deal.objects.create(name="Deal 1", fair_market_value=5100, estimated_value=5000, fund=self.fund, company=self.company)
        Deal.objects.create(name="Deal 2", fair_market_value=1100, estimated_value=1000, fund=self.fund, company=self.company)
        Deal.objects.create(name="Deal 3", fair_market_value=3100, estimated_value=3000, fund=self.fund, company=self.company)
        self.assertEqual(self.fund.carry_estimated_value, 9000)
        self.assertEqual(self.fund.carry_fair_market_value, 9300)

        # verify estimated value and fair market value of carry plan is sum of related funds/deals
        fund_2 = FundCarryPlanFactory(fund=FundFactory(company=self.company), carry_plan=carry_plan).fund
        fund_2.estimated_value = 250
        fund_2.fair_market_value = 270
        fund_2.save()
        deal_2 = DealCarryPlanFactory(deal=DealFactory(company=self.company), carry_plan=carry_plan).deal
        deal_2.estimated_value = 150
        deal_2.fair_market_value = 170
        deal_2.save()

        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result_allocation = response.data[0]
        self.assertEqual(result_allocation['carry_plan_estimated_value'], 9400)
        self.assertEqual(result_allocation['carry_plan_fair_market_value'], 9740)

    def test_carry_plan_with_multi_funds_deals(self):
        carry_plan = CarryPlanFactory(
            company=self.company
        )
        self.fund.estimated_value_date = datetime.now().date() - timedelta(days=4)
        self.fund.fair_market_value_date = datetime.now().date()
        self.fund.save()

        deal = DealFactory(
            company=self.company,
            estimated_value_date=datetime.now().date() - timedelta(days=2),
            fair_market_value_date=datetime.now().date()  - timedelta(days=6)
        )
        DealCarryPlanFactory(deal=deal, carry_plan=carry_plan)
        fund_carry_plan = FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps": 40,
                    "allocation_id": None,
                    "grant_date": datetime.now(),
                    "vesting_schedule": self.vesting_schedule.id,
                    "vesting_start_date": datetime.now().date(),
                }
            ]}
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data
        self.assertEqual(result_allocation[0]['estimated_value_date'], deal.estimated_value_date.strftime('%Y-%m-%d'))
        self.assertEqual(result_allocation[0]['fair_market_value_date'], self.fund.fair_market_value_date.strftime('%Y-%m-%d'))


    def test_forfeiture_for_multiple_allocations(self):
        """
        Test that verifies forfeiture is separate for each allocation for same user
        """
        fund_carry_plan = self.create_fund_carry_plan_with_allocation()
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})
        forfeit_url = reverse('forfeiture', kwargs={'user_id': self.user.id})

        self.add_allocation_in_carry_plan(fund_carry_plan.carry_plan)
        self.add_allocation_in_carry_plan(fund_carry_plan.carry_plan)

        carry_pool = get_carry_pool_of_carry_plan(fund_carry_plan.carry_plan.id, fund_carry_plan.carry_plan.company_id)
        allocation1 = carry_pool.allocations[0]
        allocation2 = carry_pool.allocations[1]
        self.assertEqual(allocation1['bps'], '40')
        self.assertEqual(allocation1['forfeited_bps'], 0)
        self.assertEqual(allocation2['bps'], '40')
        self.assertEqual(allocation2['forfeited_bps'], 0)

        # verify both allocations are for same user
        self.assertEqual(allocation1['carry_participant_id'], allocation2['carry_participant_id'])

        forfeiture_date1 = datetime(2026, 12, 21, 15, 30, 45)
        forfeiture_date2 = datetime(2025, 3, 1, 15, 30, 45)
        request_data = [
            {
                "allocation_id": carry_pool.allocations[0]['allocation_id'],
                "parent_pool_id": carry_pool.external_id,
                "base_pool_id": carry_pool.external_id,
                "bps": 18,
                "forfeiture_date": forfeiture_date1.date().strftime("%m/%d/%Y")
            },
            {
                "allocation_id": carry_pool.allocations[1]['allocation_id'],
                "parent_pool_id": carry_pool.external_id,
                "base_pool_id": carry_pool.external_id,
                "bps": 8,
                "forfeiture_date": forfeiture_date2.date().strftime("%m/%d/%Y")
            }
        ]

        response = self.client.post(forfeit_url, data=request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        allocation1 = response.data[0]
        self.assertEqual(allocation1['bps'], '22')
        self.assertEqual(allocation1['forfeited_bps'], 18)
        allocation2 = response.data[1]
        self.assertEqual(allocation2['bps'], '32')
        self.assertEqual(allocation2['forfeited_bps'], 8)

        # verify custom forfeiture dates
        allocation_action = AllocationAction.objects.filter(
            allocation_id__in=[allocation1['allocation_id'], allocation2['allocation_id']],
            type=AllocationAction.Type.FORFEIT.value
        )
        self.assertEqual(allocation_action.count(), 2)
        self.assertEqual(allocation_action[0].grant_date.date(), forfeiture_date1.date())
        self.assertEqual(allocation_action[0].bps, 18)
        self.assertEqual(allocation_action[1].grant_date.date(), forfeiture_date2.date())
        self.assertEqual(allocation_action[1].bps, 8)

    def test_allocation_vesting_start_date(self):
        """
        Test to verify that vesting will start from allocation's vesting start date
        If we provide vesting start date in allocation, then it will override carry plan's vesting start date
        in all calculations
        """
        self.create_fund_carry_plan_with_allocation(
            vesting_start_date=datetime.now(),
            points=60,
            allocation_vesting_start_date=datetime.now() + relativedelta(years=2, days=1)
        )
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})

        as_of_date = datetime.now().strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['bps'], '60')
        self.assertEqual(result_allocation['vested_bps'], 0)

        as_of_date = (datetime.now() + relativedelta(years=2, days=30)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['vested_bps'], 0)

        as_of_date = (datetime.now() + relativedelta(years=3, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        # TODO: uncomment when 28th february passes
        # self.assertEqual(result_allocation['vested_bps'], 15)

        as_of_date = (datetime.now() + relativedelta(years=4, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['vested_bps'], 30)

        as_of_date = (datetime.now() + relativedelta(years=6, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['vested_bps'], 60)


    def test_unequal_vesting_using_fraction(self):
        """
        Test to verify that vesting decimals are precise when vesting schedule
        has un-equal percentage distribution across periods that do not add upto 100% in decimals
        """
        self.create_fund_carry_plan_with_allocation(
            vesting_start_date=datetime.now(),
            points=6,
            vesting_schedule=self.fraction_vesting_schedule.id
        )
        url = reverse('user-carry-allocations', kwargs={'user_id': self.user.id})

        as_of_date = datetime.now().strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['bps'], '6')
        self.assertEqual(result_allocation['vested_bps'], 0)

        as_of_date = (datetime.now() + relativedelta(years=1, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # vested points should be 2 instead of 1.99999998
        result_allocation = response.data[0]
        self.assertEqual(result_allocation['bps'], '6')
        self.assertEqual(result_allocation['vested_bps'], 2)

        as_of_date = (datetime.now() + relativedelta(years=2, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # vested points should be 4 instead of 3.99999998
        result_allocation = response.data[0]
        self.assertEqual(result_allocation['bps'], '6')
        self.assertEqual(result_allocation['vested_bps'], 4)

        as_of_date = (datetime.now() + relativedelta(years=3, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # vested points should be 6 instead of 5.99999998
        result_allocation = response.data[0]
        self.assertEqual(result_allocation['bps'], '6')
        self.assertEqual(result_allocation['vested_bps'], 6)


    def test_no_vesting_start_date(self):
        """
        Test to verify that vested points will always be 0 if vesting start date is not
        available in allocation and carry plan(effective date)
        """
        carry_plan = CarryPlanFactory(company=self.company, effective_date=None)
        FundCarryPlanFactory(fund=self.fund, carry_plan=carry_plan)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": self.carry_participant.id,
                    "bps":  40,
                    "allocation_id": None,
                    "grant_date": datetime.now(),
                    "vesting_schedule": self.vesting_schedule.id,
                    "vesting_start_date": None
                }
            ]}
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})

        self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        url = reverse('carry-fund-participants', kwargs={'pk': self.fund.id})

        as_of_date = datetime.now().strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['bps'], '40')
        self.assertEqual(result_allocation['vested_bps'], '0')

        as_of_date = (datetime.now() + relativedelta(years=2, days=30)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['vested_bps'], '0')

        as_of_date = (datetime.now() + relativedelta(years=13, days=1)).strftime('%Y-%m-%d')
        response = self.client.get(url, HTTP_AS_OF_DATE=as_of_date)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        result_allocation = response.data[0]
        self.assertEqual(result_allocation['vested_bps'], '0')
