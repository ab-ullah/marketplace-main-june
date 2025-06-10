from datetime import datetime

from django.urls import reverse
from rest_framework import status

from api.carry_pools.entities import Allocation, AllocationsOverview
from api.carry_pools.models import FundCarryPlan, CarryPool, CarryGpCommitment
from api.carry_pools.tests.factories import CarryFundFactory, FundCarryPlanFactory, CarryPoolFactory, \
    CarryParticipantFactory, CarryGpCommitmentFactory
from api.carry_pools.serializers import UserCarryDetailSerializer
from api.carry_pools.tests.views.base import CarryTestCase
from api.carry_pools.utils import get_all_latest_published_pools_for_company
from api.funds.models import Fund
from api.partners.tests.factories import UserFactory
from core.base_tests import BaseTestCase


class InvestorDashboardAPITestCase(CarryTestCase):
    def setUp(self):
        self.create_user()
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)

    def test_dashboard_endpoints(self):
        overview_url = reverse('carry-participant-overview')
        allocations_url = reverse('participant-carry-plans')

        fund: Fund = CarryFundFactory.create(company=self.company)
        fund.estimated_value_date = datetime.strptime('2024-10-20', '%Y-%m-%d').date()
        fund.fair_market_value_date = datetime.strptime('2024-10-22', '%Y-%m-%d').date()
        fund.estimated_value = 2000
        fund.save()
        fund_carry_plan: FundCarryPlan = FundCarryPlanFactory.create(fund=fund)
        fund_carry_plan_2: FundCarryPlan = FundCarryPlanFactory.create(fund=fund)

        pool = CarryPoolFactory.create(
            carry_plan=fund_carry_plan.carry_plan,
            company=fund_carry_plan.carry_plan.company,
        )
        pool_2 = CarryPoolFactory.create(
            carry_plan=fund_carry_plan_2.carry_plan,
            company=fund_carry_plan_2.carry_plan.company,
        )

        allocations = [
            Allocation(bps=23, carry_participant_id=self.carry_participant.id),
        ]

        self.client.force_authenticate(self.admin_user.user)
        self.add_participants(pool.external_id, allocations, fund_carry_plan.carry_plan.id)
        self.add_participants(pool_2.external_id, allocations, fund_carry_plan_2.carry_plan.id)
        self.client.force_authenticate(self.user)

        # assume carry pools 1 and 2 are in published state
        CarryPool.objects.filter(company=self.company).update(status=CarryPool.Status.PUBLISHED.value)
        
        overview_res = self.client.get(overview_url)
        self.assertEqual(overview_res.status_code, status.HTTP_200_OK)
        self.assertEqual(overview_res.json()['allocations_count'], 2)
        self.assertEqual(overview_res.json()['total_estimated_value'], 920)

        allocations_res = self.client.get(allocations_url)
        self.assertEqual(allocations_res.status_code, status.HTTP_200_OK)
        allocations_data = allocations_res.json()
        allocations_data = UserCarryDetailSerializer(allocations_data, many=True)

        self.assertEqual(len(allocations_data.data), 2)
        self.assertEqual(allocations_data.data[0]['bps'], '23')
        self.assertEqual(allocations_data.data[0]['estimated_value_date'], fund.estimated_value_date.strftime('%Y-%m-%d'))
        self.assertEqual(allocations_data.data[0]['fair_market_value_date'], fund.fair_market_value_date.strftime('%Y-%m-%d'))


        for external_id in [pool.external_id, pool_2.external_id]:
            allocation_overview_url = reverse('carry-allocation-overview', kwargs={'external_id': external_id})
            allocation_overview_res = self.client.get(allocation_overview_url)
            self.assertEqual(allocation_overview_res.status_code, status.HTTP_200_OK)
            data = AllocationsOverview.model_validate(allocation_overview_res.json())
            self.assertIsNotNone(data)



class CarryGpCommitmentsListAPIViewTest(BaseTestCase):
    def setUp(self):
        self.create_user()
        self.carry_participant = CarryParticipantFactory(company=self.company)
        self.carry_participant.associate_with_user(self.user)

        self.client.force_authenticate(user=self.user)


    def test_carry_gp_commitments_list(self):
        fund = CarryFundFactory(
            company=self.company,
        )

        fund_2 = CarryFundFactory(
            company=self.company,
        )
        CarryGpCommitmentFactory(
            company=self.company,
            carry_participant=self.carry_participant,
            source_type=CarryGpCommitment.SourceType.FUND.value,
            source_external_id=fund.external_id,
            total_capital_commit=1000,
            cashless_commit=0,
            management_fee_offset=500,
            salary_reduction=200
        )

        CarryGpCommitmentFactory(
            company=self.company,
            carry_participant=self.carry_participant,
            source_type=CarryGpCommitment.SourceType.FUND.value,
            source_external_id=fund.external_id,
            total_capital_commit=2000,
            cashless_commit=1000,
            management_fee_offset=500,
            salary_reduction=800
        )

        CarryGpCommitmentFactory(
            company=self.company,
            carry_participant=self.carry_participant,
            source_type=CarryGpCommitment.SourceType.FUND.value,
            source_external_id=fund_2.external_id,
            total_capital_commit=3000,
            cashless_commit=4000,
            management_fee_offset=5000,
            salary_reduction=0
        )

        test_user_two = UserFactory()
        carry_participant_two = CarryParticipantFactory(company=self.company)
        carry_participant_two.associate_with_user(test_user_two)

        CarryGpCommitmentFactory(
            company=self.company,
            carry_participant=carry_participant_two,
            source_type=CarryGpCommitment.SourceType.FUND.value,
            source_external_id=fund.external_id,
            total_capital_commit=2000,
            cashless_commit=1000,
            management_fee_offset=500,
            salary_reduction=800
        )


        url = reverse('carry-gp-commitments')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        fund_1_data = next(item for item in response.data if item['source_external_id'] == fund.external_id)
        self.assertEqual(fund_1_data['total_capital_commit'], 3000)
        self.assertEqual(fund_1_data['cashless_commit'], 1000)
        self.assertEqual(fund_1_data['management_fee_offset'], 1000)
        self.assertEqual(fund_1_data['salary_reduction'], 1000)


        fund_2_data = next(item for item in response.data if item['source_external_id'] == fund_2.external_id)
        self.assertEqual(fund_2_data['total_capital_commit'], 3000)
        self.assertEqual(fund_2_data['cashless_commit'], 4000)
        self.assertEqual(fund_2_data['management_fee_offset'], 5000)
        self.assertEqual(fund_2_data['salary_reduction'], 0)
