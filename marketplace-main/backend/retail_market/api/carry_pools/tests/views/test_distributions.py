import http
from datetime import datetime

from _decimal import Decimal
from django.urls import reverse
from django.utils.timezone import now
from rest_framework import status

from api.carry_pools.entities import Allocation, DistributionsAdminOverview
from api.carry_pools.models import Deal, CarryParticipant, Distribution, CarryDistributionAPILog, FundRealization, \
    Realization, ParticipantDistribution
from api.carry_pools.tests.factories import DealCarryPlanFactory, FundCarryPlanFactory, CarryParticipantFactory, \
    DealFactory, CarryPoolFactory
from api.carry_pools.tests.views.base import CarryTestCase
from api.funds.models import Fund
from api.partners.tests.factories import UserFactory, CompanyUserFactory, FundFactory


class TestDistributions(CarryTestCase):

    def setUp(self) -> None:
        self.create_user()
        fund = FundFactory(company=self.company)
        deal = DealFactory(company=self.company)
        self.fund_carry_plan = FundCarryPlanFactory(fund=fund)
        CarryPoolFactory.create(
            carry_plan=self.fund_carry_plan.carry_plan,
            company=self.company
        )
        self.deal_carry_plan = DealCarryPlanFactory(deal=deal)
        CarryPoolFactory.create(
            carry_plan=self.deal_carry_plan.carry_plan,
            company=self.company
        )

    def create_carry_participant(self, company) -> CarryParticipant:
        user = UserFactory()
        CompanyUserFactory(user=user, company=company)
        carry_participant = CarryParticipantFactory(company=company)
        carry_participant.associate_with_user(user)
        return carry_participant

    def test_distribute_carry_plan_no_participants(self):
        fund = self.fund_carry_plan.fund
        amount = 1_000_000
        escrow = 0
        distribution_date = now()
        self.client.force_authenticate(self.admin_user.user)
        payload = {
            "fund_external_id": fund.external_id,
            "amount": amount,
            "distribution_date": distribution_date,
            "escrow": escrow
        }
        res = self.client.post(reverse('admin-carry-distributions'), payload)
        self.assertEqual(res.status_code, http.HTTPStatus.BAD_REQUEST)
        company_distributions = self.list_all_distributions()
        self.assertEqual(0, len(company_distributions.distributions))

    def test_create_distribution_for_a_fund(self):
        carry_plan = self.fund_carry_plan.carry_plan
        last_carry_pool = carry_plan.carry_pools.latest('created_at')
        carry_participants = [self.create_carry_participant(self.company) for _ in range(4)]
        allocations = [
            Allocation(bps=(i + 1) * 10, carry_participant_id=participant.id) for i, participant in
            enumerate(carry_participants)
        ]
        self.client.force_authenticate(self.admin_user.user)
        self.add_participants(last_carry_pool.external_id, allocations, carry_plan.id)

        fund = self.fund_carry_plan.fund
        amount = 1_000_000
        escrow = 0
        distribution_date = now()
        self.client.force_authenticate(self.admin_user.user)
        last_carry_pool = carry_plan.carry_pools.latest('created_at')
        allocations = last_carry_pool.allocations
        # create allocation distributions
        for allocation in allocations:
            points = float(allocation['bps'])
            allocation['amount'] = (points * amount) / 100
            allocation['escrow'] = (amount * (escrow / 100)) * (points / 100)
            allocation['net_distribution'] = allocation['amount'] - allocation['escrow']
            allocation['escrow_percentage'] = escrow

        payload = {
            "fund_external_id": fund.external_id,
            "amount": amount,
            "distribution_date": distribution_date,
            "escrow": escrow,
            "allocations": allocations
        }
        url = reverse('admin-carry-distributions')
        res = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(res.status_code, http.HTTPStatus.CREATED)

        # validate total fund distribution in carry funds api
        url = reverse('carry-funds')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()
        testing_fund = None
        for fund_data in response_data:
            if fund_data['external_id'] == fund.external_id:
                testing_fund = fund_data
                break
        self.assertEqual(testing_fund['total_distributions'], amount)

    def test_distribute_today_carry_plan_no_escrow(self):
        # create the allocations
        carry_plan_1 = self.fund_carry_plan.carry_plan
        carry_plan_2 = self.deal_carry_plan.carry_plan
        last_carry_pool_1 = carry_plan_1.carry_pools.latest('created_at')
        last_carry_pool_2 = carry_plan_2.carry_pools.latest('created_at')
        carry_participants = [self.create_carry_participant(self.company) for _ in range(4)]
        percentage = 100 / len(carry_participants)
        allocations = [
            Allocation(bps=percentage, carry_participant_id=participant.id) for participant in carry_participants
        ]
        self.client.force_authenticate(self.admin_user.user)
        self.add_participants(last_carry_pool_1.external_id, allocations, carry_plan_1.id)
        self.add_participants(last_carry_pool_2.external_id, allocations, carry_plan_2.id)

        # create the distribution for a fund
        fund = self.fund_carry_plan.fund
        amount = 1_000_000
        escrow = 0
        distribution_date = now()

        # get carry plan details mainly for fetching allocations (FE logic)
        # we will get direct allocations from carry pool for testing purpose only
        carry_plan_for_distribution = self.retrieve_carry_plan_for_distribution(fund.external_id, distribution_date)
        allocations = carry_plan_for_distribution['allocations']

        self.client.force_authenticate(self.admin_user.user)
        self.create_fund_distribution(
            fund,
            amount,
            distribution_date,
            escrow,
            allocations)
        company_distributions = self.list_all_distributions()

        self.assertEqual(1, len(company_distributions.distributions))
        distribution = company_distributions.distributions[0]

        self.assertEqual(distribution.amount, amount)
        self.assertEqual(distribution.escrow, escrow)
        self.assertEqual(distribution.source, fund.name)
        self.assertEqual(distribution.date.date(), distribution_date.date())

        # create a distribution and allocation distributions for a deal
        deal = self.deal_carry_plan.deal
        last_carry_pool_2 = carry_plan_2.carry_pools.latest('created_at')
        allocations = last_carry_pool_2.allocations
        self.create_deal_distribution(deal, amount, distribution_date, escrow, allocations)
        company_distributions = self.list_all_distributions()
        self.assertEqual(2, len(company_distributions.distributions))

        # assert that for each carry participant user, we see the correct distribution
        for participant in carry_participants:
            self.client.force_authenticate(participant.carry_participant_user.first().user)
            investor_distributions = self.list_investor_distributions()
            self.assertEqual(len(investor_distributions.distributions), 2)
            investor_distribution = investor_distributions.distributions[0]
            self.assertEqual(investor_distribution.amount, Decimal(amount // 4))
            self.assertEqual(investor_distribution.date.date(), distribution_date.date())
            self.assertEqual(investor_distribution.escrow, 0)
            self.assertEqual(investor_distribution.source, fund.name)

            investor_distribution = investor_distributions.distributions[1]
            self.assertEqual(investor_distribution.amount, Decimal(amount // 4))
            self.assertEqual(investor_distribution.date.date(), distribution_date.date())
            self.assertEqual(investor_distribution.escrow, 0)
            self.assertEqual(investor_distribution.source, deal.name)


    def test_distribute_carry_plan_with_escrow(self):
        # create the allocations
        carry_plan = self.fund_carry_plan.carry_plan
        last_carry_pool = carry_plan.carry_pools.latest('created_at')
        carry_participants = [self.create_carry_participant(self.company) for _ in range(4)]
        percentage = 100 // len(carry_participants)
        allocations = [
            Allocation(bps=percentage, carry_participant_id=participant.id) for participant in carry_participants
        ]
        self.client.force_authenticate(self.admin_user.user)
        self.add_participants(last_carry_pool.external_id, allocations, carry_plan.id)

        # create the distribution for a fund
        fund = self.fund_carry_plan.fund
        amount = 1_000_000
        escrow = 10

        # in this case, the distribution and escrow are even in all participants
        escrow_amount = (amount * (escrow / 100)) * (percentage / 100)
        gross_distribution = (amount * (percentage / 100))
        distribution_date = now()
        allocations = carry_plan.carry_pools.latest('created_at').allocations

        self.client.force_authenticate(self.admin_user.user)
        self.create_fund_distribution(fund, amount, distribution_date, escrow, allocations)

        # assert that for each carry participant user, we see the correct distribution
        for participant in carry_participants:
            self.client.force_authenticate(participant.carry_participant_user.first().user)
            investor_distributions = self.list_investor_distributions()
            self.assertEqual(len(investor_distributions.distributions), 1)
            investor_distribution = investor_distributions.distributions[0]
            self.assertEqual(investor_distribution.amount, gross_distribution)
            self.assertEqual(investor_distribution.date.date(), distribution_date.date())
            self.assertEqual(investor_distribution.escrow, escrow_amount)
            self.assertEqual(investor_distribution.source, fund.name)

    def test_distribute_uneven_points_carry_plan_with_escrow(self):
        # create the allocations
        carry_plan = self.fund_carry_plan.carry_plan
        last_carry_pool = carry_plan.carry_pools.latest('created_at')
        carry_participants = [self.create_carry_participant(self.company) for _ in range(4)]
        allocations = [
            Allocation(bps=(i + 1) * 10, carry_participant_id=participant.id) for i, participant in
            enumerate(carry_participants)
        ]
        participant_points = [10, 20, 30, 40]
        self.client.force_authenticate(self.admin_user.user)
        self.add_participants(last_carry_pool.external_id, allocations, carry_plan.id)

        # create the distribution for a fund
        fund = self.fund_carry_plan.fund
        amount = 1_000_000
        escrow = 10
        distribution_date = now()
        self.client.force_authenticate(self.admin_user.user)
        # create allocations with distributions amounts
        last_carry_pool = carry_plan.carry_pools.latest('created_at')
        allocations = last_carry_pool.allocations

        self.create_fund_distribution(fund, amount, distribution_date, escrow, allocations)

        # assert that for each carry participant user, we see the correct distribution
        participant_1, participant_2, participant_3, participant_4 = carry_participants
        self.client.force_authenticate(participant_1.carry_participant_user.first().user)
        investor_distributions = self.list_investor_distributions()
        self.assertEqual(len(investor_distributions.distributions), 1)
        investor_distribution = investor_distributions.distributions[0]
        escrow_amount = (amount * escrow / 100) * (participant_points[0] / 100)
        gross_distribution = (amount * (participant_points[0] / 100))
        self.assertEqual(investor_distribution.amount, gross_distribution)
        self.assertEqual(investor_distribution.date.date(), distribution_date.date())
        self.assertEqual(investor_distribution.escrow, escrow_amount)
        self.assertEqual(investor_distribution.source, fund.name)

        self.client.force_authenticate(participant_2.carry_participant_user.first().user)
        investor_distributions = self.list_investor_distributions()
        self.assertEqual(len(investor_distributions.distributions), 1)
        investor_distribution = investor_distributions.distributions[0]
        escrow_amount = (amount * (escrow / 100)) * (participant_points[1] / 100)
        gross_distribution = (amount * (participant_points[1] / 100))
        self.assertEqual(investor_distribution.amount, gross_distribution)
        self.assertEqual(investor_distribution.date.date(), distribution_date.date())
        self.assertEqual(investor_distribution.escrow, escrow_amount)
        self.assertEqual(investor_distribution.source, fund.name)

        self.client.force_authenticate(participant_3.carry_participant_user.first().user)
        investor_distributions = self.list_investor_distributions()
        self.assertEqual(len(investor_distributions.distributions), 1)
        investor_distribution = investor_distributions.distributions[0]
        escrow_amount = (amount * (escrow / 100)) * (participant_points[2] / 100)
        gross_distribution = (amount * (participant_points[2] / 100))
        self.assertEqual(investor_distribution.amount, gross_distribution)
        self.assertEqual(investor_distribution.date.date(), distribution_date.date())
        self.assertEqual(investor_distribution.escrow, escrow_amount)
        self.assertEqual(investor_distribution.source, fund.name)

        self.client.force_authenticate(participant_4.carry_participant_user.first().user)
        investor_distributions = self.list_investor_distributions()
        self.assertEqual(len(investor_distributions.distributions), 1)
        investor_distribution = investor_distributions.distributions[0]
        escrow_amount = (amount * (escrow / 100)) * (participant_points[3] / 100)
        gross_distribution = (amount * (participant_points[3] / 100))
        self.assertEqual(investor_distribution.amount, gross_distribution)
        self.assertEqual(investor_distribution.date.date(), distribution_date.date())
        self.assertEqual(investor_distribution.escrow, escrow_amount)
        self.assertEqual(investor_distribution.source, fund.name)

    def test_delete_distribution(self):
        fund = FundFactory(company=self.company)
        carry_plan = FundCarryPlanFactory(fund=fund).carry_plan
        carry_participant = CarryParticipantFactory(company=self.company)
        CarryPoolFactory(carry_plan=carry_plan, company=self.company)

        payload = {
            "allocations": [
                {
                    "carry_participant_id": carry_participant.id,
                    "bps": 55,
                    "allocation_id": None
                },
                {
                    "carry_participant_id": carry_participant.id,
                    "bps": 15,
                    "allocation_id": None
                }
            ],
            "mode": None
        }

        self.client.force_authenticate(self.admin_user.user)
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan.id})
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )

        last_carry_pool = carry_plan.carry_pools.latest('created_at')

        # create the distribution for a fund
        fund = self.fund_carry_plan.fund
        amount = 1_000_000
        escrow = 10
        allocations = carry_plan.carry_pools.latest('created_at').allocations
        # in this case, the distribution and escrow are even in all participants
        distribution_date = now()
        self.client.force_authenticate(self.admin_user.user)
        self.create_fund_distribution(fund, amount, distribution_date, escrow, allocations)

        self.assertEqual(Distribution.objects.count(), 1)
        self.assertEqual(FundRealization.objects.count(), 1)
        self.assertEqual(Realization.objects.count(), 1)
        self.assertEqual(ParticipantDistribution.objects.count(), 2)

        distribution = self.list_all_distributions().distributions[0]
        url = reverse('carry-distribution-retrieve-update', kwargs={"pk": distribution.id})
        res = self.client.delete(
            url,
            **self.get_headers()
        )
        self.assertEqual(res.status_code, http.HTTPStatus.NO_CONTENT)

        self.assertEqual(Distribution.objects.count(), 0)
        self.assertEqual(FundRealization.objects.count(), 0)
        self.assertEqual(Realization.objects.count(), 0)
        self.assertEqual(ParticipantDistribution.objects.count(), 0)

        self.assertEqual(Distribution.include_deleted.count(), 1)
        self.assertEqual(FundRealization.include_deleted.count(), 1)
        self.assertEqual(Realization.include_deleted.count(), 1)
        self.assertEqual(ParticipantDistribution.include_deleted.count(), 2)


    def test_edit_distribution(self):
        # create the allocations
        carry_plan_1 = self.fund_carry_plan.carry_plan
        carry_plan_2 = self.deal_carry_plan.carry_plan
        last_carry_pool_1 = carry_plan_1.carry_pools.latest('created_at')
        last_carry_pool_2 = carry_plan_2.carry_pools.latest('created_at')
        carry_participants = [self.create_carry_participant(self.company) for _ in range(4)]
        percentage = 100 // len(carry_participants)
        allocations = [
            Allocation(bps=percentage, carry_participant_id=participant.id) for participant in carry_participants
        ]
        self.client.force_authenticate(self.admin_user.user)
        self.add_participants(last_carry_pool_1.external_id, allocations, carry_plan_1.id)
        self.add_participants(last_carry_pool_2.external_id, allocations, carry_plan_2.id)

        # create the distribution for a fund
        fund = self.fund_carry_plan.fund
        amount = 1_000_000
        escrow = 10
        allocations = carry_plan_1.carry_pools.latest('created_at').allocations
        # in this case, the distribution and escrow are even in all participants
        distribution_date = now()
        self.client.force_authenticate(self.admin_user.user)
        self.create_fund_distribution(fund, amount, distribution_date, escrow, allocations)

        # set a new amount and escrow for the distribution
        distribution = self.list_all_distributions().distributions[0]
        new_amount = 2_000_000
        new_escrow = 20
        self.edit_fund_distribution(distribution, amount=new_amount, escrow=new_escrow)
        escrow_amount = (new_amount * (new_escrow / 100)) * (percentage / 100)
        gross_distribution = (new_amount * (percentage / 100))
        distribution_date = now()

        # assert that for each carry participant user, we see the correct distribution
        for participant in carry_participants:
            self.client.force_authenticate(participant.carry_participant_user.first().user)
            investor_distributions = self.list_investor_distributions()
            self.assertEqual(len(investor_distributions.distributions), 1)
            investor_distribution = investor_distributions.distributions[0]
            self.assertEqual(investor_distribution.amount, gross_distribution)
            self.assertEqual(investor_distribution.date.date(), distribution_date.date())
            self.assertEqual(investor_distribution.escrow, escrow_amount)
            self.assertEqual(investor_distribution.source, fund.name)

    def create_fund_distribution(self,
                                 fund: Fund,
                                 amount: int,
                                 distribution_date: datetime,
                                 escrow: int,
                                 allocations: list
                                 ) -> object:
        url = reverse('admin-carry-distributions')

        # create allocation distributions
        for allocation in allocations:
            points = float(allocation['bps'])
            allocation['amount'] = (points * amount) / 100
            allocation['escrow'] = (amount * escrow / 100) * (points / 100)
            allocation['net_distribution'] = allocation['amount'] - allocation['escrow']
            allocation['escrow_percentage'] = escrow

        payload = {
            "fund_external_id": fund.external_id,
            "amount": amount,
            "date": distribution_date,
            "escrow": escrow,
            "allocations": allocations
        }
        res = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(res.status_code, http.HTTPStatus.CREATED)
        return res.json()

    def list_all_distributions(self):
        url = reverse("admin-carry-distributions")
        res = self.client.get(url)
        self.assertEqual(res.status_code, http.HTTPStatus.OK)
        content = DistributionsAdminOverview.from_response(res)
        return content

    def create_deal_distribution(self, deal: Deal, amount: int, distribution_date: datetime,
                                 escrow: int, allocations: list):
        url = reverse('admin-carry-distributions')
        # create allocation distributions
        for allocation in allocations:
            points = float(allocation['bps'])
            allocation['amount'] = (points * amount) / 100
            allocation['escrow'] = (amount * escrow / 100) * (points / 100)
            allocation['net_distribution'] = allocation['amount'] - allocation['escrow']
            allocation['escrow_percentage'] = escrow

        payload = {
            "deal_external_id": deal.external_id,
            "amount": amount,
            "distribution_date": distribution_date,
            "escrow": escrow,
            "allocations": allocations
        }
        res = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(res.status_code, http.HTTPStatus.CREATED)
        return res.json()

    def list_investor_distributions(self):
        url = reverse('investor-list-distributions')
        res = self.client.get(url)
        self.assertEqual(res.status_code, http.HTTPStatus.OK)
        content = DistributionsAdminOverview.from_response(res)
        return content

    def edit_fund_distribution(self, distribution, amount: int = None, escrow: int = None):
        distribution_details = self.retrieve_distribution(distribution.id)
        allocations = distribution_details['allocations']

        url = reverse('carry-distribution-retrieve-update', kwargs={"pk": distribution.id})
        data = {}
        if amount:
            data['amount'] = amount
        if escrow:
            data['escrow'] = escrow

        # create allocation distributions for edit
        if amount and escrow:
            for allocation in allocations:
                points = allocation['points']
                allocation['amount'] = (points * amount) / 100
                allocation['escrow'] = (amount * escrow / 100) * (points / 100)
                allocation['net_distribution'] = allocation['amount'] - allocation['escrow']
                allocation['escrow_percentage'] = escrow
            data['allocations'] = allocations

        res = self.client.patch(
            url,
            data=data,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(res.status_code, http.HTTPStatus.OK)

    def retrieve_distribution(self, distribution_id):
        url = reverse('carry-distribution-retrieve-update', kwargs={"pk": distribution_id})
        res = self.client.get(url)
        self.assertEqual(res.status_code, http.HTTPStatus.OK)
        return res.json()

    def retrieve_carry_plan_for_distribution(self, external_id, distribution_date):
        url = reverse('distribution-carry-plan-details')
        payload = {'external_id': external_id, 'distribution_date': distribution_date}
        res = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(res.status_code, http.HTTPStatus.OK)
        return res.json()

    def test_distributions_manual_flag(self):
        carry_plan = self.fund_carry_plan.carry_plan
        last_carry_pool = carry_plan.carry_pools.latest('created_at')
        carry_participants = [self.create_carry_participant(self.company) for _ in range(4)]
        allocations = [
            Allocation(bps=(i + 1) * 10, carry_participant_id=participant.id) for i, participant in
            enumerate(carry_participants)
        ]
        self.client.force_authenticate(self.admin_user.user)
        self.add_participants(last_carry_pool.external_id, allocations, carry_plan.id)

        fund = self.fund_carry_plan.fund
        amount = 1_000_000
        escrow = 0
        distribution_date = now()
        self.client.force_authenticate(self.admin_user.user)
        last_carry_pool = carry_plan.carry_pools.latest('created_at')
        allocations = last_carry_pool.allocations
        # create allocation distributions
        for allocation in allocations:
            points = float(allocation['bps'])
            allocation['amount'] = (points * amount) / 100
            allocation['escrow'] = (amount * (escrow / 100)) * (points / 100)
            allocation['net_distribution'] = allocation['amount'] - allocation['escrow']
            allocation['escrow_percentage'] = escrow

        payload = {
            "fund_external_id": fund.external_id,
            "amount": amount,
            "distribution_date": distribution_date,
            "escrow": escrow,
            "allocations": allocations,
            "is_manual": True
        }
        url = reverse('admin-carry-distributions')
        res = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(res.status_code, http.HTTPStatus.CREATED)

        self.assertEqual(Distribution.objects.count(), 1)
        self.assertEqual(Distribution.objects.first().is_manual, True)

        # validate api log
        self.assertEqual(CarryDistributionAPILog.objects.count(), 1)

    def test_distributions_unallocated_carry_value(self):
        carry_plan = self.fund_carry_plan.carry_plan
        last_carry_pool = carry_plan.carry_pools.latest('created_at')
        carry_participants = [self.create_carry_participant(self.company) for _ in range(4)]
        allocations = [
            Allocation(bps=(i + 1) * 5, carry_participant_id=participant.id) for i, participant in
            enumerate(carry_participants)
        ]
        self.client.force_authenticate(self.admin_user.user)
        self.add_participants(last_carry_pool.external_id, allocations, carry_plan.id)

        fund = self.fund_carry_plan.fund
        amount = 1_000_000
        escrow = 0
        distribution_date = now()
        self.client.force_authenticate(self.admin_user.user)
        last_carry_pool = carry_plan.carry_pools.latest('created_at')
        allocations = last_carry_pool.allocations
        # create allocation distributions
        for allocation in allocations:
            points = float(allocation['bps'])
            allocation['amount'] = (points * amount) / 100
            allocation['escrow'] = (amount * (escrow / 100)) * (points / 100)
            allocation['net_distribution'] = allocation['amount'] - allocation['escrow']
            allocation['escrow_percentage'] = escrow

        payload = {
            "fund_external_id": fund.external_id,
            "amount": amount,
            "distribution_date": distribution_date,
            "escrow": escrow,
            "allocations": allocations,
            "is_manual": False
        }
        url = reverse('admin-carry-distributions')
        res = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(res.status_code, http.HTTPStatus.CREATED)

        self.assertEqual(Distribution.objects.count(), 1)
        self.assertEqual(Distribution.objects.first().is_manual, False)

        # validate unallocated carry value, should be 50% of distribution amount in this case
        url = reverse("admin-carry-distributions")
        res = self.client.get(url)
        self.assertEqual(res.status_code, http.HTTPStatus.OK)
        data = res.data
        self.assertEqual(data['unallocated_carry_value'], 500000)
