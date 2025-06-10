from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.models import AdminUser
from api.carry_pools.models import CarryParticipant

from api.partners.tests.factories import UserFactory, CompanyUserFactory
from core.base_tests import BaseTestCase


class CarryParticipantTestCase(BaseTestCase):

    def setUp(self):
        self.create_company()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        AdminUser.objects.create(user=self.user, company=self.company)

    def test_fetch_all_users(self):
        user_one = UserFactory(email="a@email.com")
        user_two = UserFactory(email="b@email.com")

        user_one.first_name = 'John'
        user_one.last_name = 'Smith'
        user_one.save()
        user_two.first_name = 'Mujahid'
        user_two.last_name = 'Iqbal'
        user_two.save()

        CompanyUserFactory(company=self.company, user=user_one)
        CompanyUserFactory(company=self.company, user=user_two)

        url = reverse('carry-list-all-users')
        response = self.client.get(
            url,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['email'], user_one.email)
        self.assertEqual(result[0]['first_name'], user_one.first_name)
        self.assertEqual(result[0]['last_name'], user_one.last_name)
        self.assertEqual(result[0]['is_individual_participant'], False)
        self.assertEqual(result[1]['email'], user_two.email)
        self.assertEqual(result[1]['first_name'], user_two.first_name)
        self.assertEqual(result[1]['last_name'], user_two.last_name)
        self.assertEqual(result[1]['is_individual_participant'], False)

    def test_carry_participant_creation(self):
        # create user and carry individual participant
        url = reverse('carry-participant-create')
        payload = {
            'first_name': 'M',
            'last_name' : 'J',
            'email' : 'mj@mujahid.com'

        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['entity'], CarryParticipant.EntityType.INDIVIDUAL.value)
        self.assertEqual(response.data['first_name'], 'M')
        self.assertEqual(response.data['last_name'], 'J')

        # create carry business participant for same user
        url = reverse('carry-participant-create')
        payload = {
            'first_name': 'M',
            'last_name': 'J',
            'email': 'mj@mujahid.com',
            'entity_name': 'MJ BUSINESS',
            'entity': CarryParticipant.EntityType.CORPORATE.value
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['entity'], CarryParticipant.EntityType.CORPORATE.value)
        self.assertEqual(response.data['first_name'], 'M')
        self.assertEqual(response.data['last_name'], 'J')
        self.assertEqual(response.data['entity_name'], 'MJ BUSINESS')
        payload = {
            'first_name': 'A',
            'last_name': 'D',
            'email': 'ad@dorda.com',
            'entity_name': 'AD TRUST',
            'entity': CarryParticipant.EntityType.TRUST.value
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['entity'], CarryParticipant.EntityType.TRUST.value)
        self.assertEqual(response.data['first_name'], 'A')
        self.assertEqual(response.data['last_name'], 'D')
        self.assertEqual(response.data['entity_name'], 'AD TRUST')


        # user already exists, create individual carry participant
        user_one = UserFactory(email="mj2@mujahid.com")
        user_one.first_name = 'Mujahid'
        user_one.last_name = 'Iqbal'
        user_one.save()
        CompanyUserFactory(company=self.company, user=user_one)

        url = reverse('carry-participant-create')
        payload = {
            'first_name': 'Mujahid',
            'last_name': 'Iqbal',
            'email': user_one.email
        }
        response = self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # test fetch api and individual status of all users
        url = reverse('carry-list-all-users')
        response = self.client.get(
            url,
            format='json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data

        self.assertEqual(len(result), 3)
        self.assertEqual(result[0]['email'], 'ad@dorda.com')
        self.assertEqual(result[0]['is_individual_participant'], False)
        self.assertEqual(result[1]['email'], "mj2@mujahid.com")
        self.assertEqual(result[1]['is_individual_participant'], True)
        self.assertEqual(result[2]['email'], "mj@mujahid.com")
        self.assertEqual(result[2]['is_individual_participant'], True)

        # test total carry participants created
        self.assertEqual(CarryParticipant.objects.filter(company=self.company).count(), 4)
