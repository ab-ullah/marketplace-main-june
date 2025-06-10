from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.carry_pools.models import CarryVehicle, CarryShareClass, CarryVehicleShareClass
from api.carry_pools.tests.views.base import CarryTestCase


class CarryVehicleAPITestCase(CarryTestCase):
    def setUp(self):
        self.client = APIClient()
        self.create_user()

        self.carry_share_class = CarryShareClass.objects.create(
            company=self.company,
            legal_name="Share Class A",
            common_name="Class A",
            description="A share class",
        )

        self.carry_vehicle_data = {
            "legal_name": "Vehicle A",
            "common_name": "Vehicle A Common",
            "share_classes": [self.carry_share_class.id]
        }

        self.client.force_authenticate(user=self.admin_user.user)

    def test_create_carry_vehicle(self):
        url = reverse('carry-vehicle-create')
        response = self.client.post(url, self.carry_vehicle_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(CarryVehicle.objects.filter(legal_name="Vehicle A").exists())

        carry_vehicle = CarryVehicle.objects.get(legal_name="Vehicle A")
        self.assertEqual(carry_vehicle.common_name, "Vehicle A Common")
        self.assertEqual(carry_vehicle.company, self.company)

        carry_vehicle_share_classes = CarryVehicleShareClass.objects.filter(vehicle=carry_vehicle)
        self.assertEqual(carry_vehicle_share_classes.count(), 1)
        self.assertEqual(carry_vehicle_share_classes.first().template_share_class, self.carry_share_class)

    def test_retrieve_carry_vehicle(self):
        carry_vehicle = CarryVehicle.objects.create(
            company=self.company,
            legal_name="Vehicle B",
            common_name="Vehicle B Common"
        )
        carry_vehicle_share_class = CarryVehicleShareClass.objects.create(
            vehicle=carry_vehicle,
            template_share_class=self.carry_share_class
        )

        url = reverse('carry-vehicle-update', args=[carry_vehicle.id])
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['legal_name'], "Vehicle B")
        self.assertEqual(response.data['common_name'], "Vehicle B Common")
        self.assertEqual(len(response.data['classes']), 1)
        self.assertEqual(response.data['classes'][0]['template_share_class']['legal_name'], "Share Class A")


class CarryShareClassAPITestCase(CarryTestCase):
    def setUp(self):
        self.create_user()
        self.client = APIClient()
        self.carry_share_class_data = {
            "legal_name": "Share Class B",
            "common_name": "Class B",
            "description": "B share class"
        }

        self.client.force_authenticate(user=self.admin_user.user)

    def test_create_carry_share_class(self):
        url = reverse('carry-share-class-create')
        response = self.client.post(url, self.carry_share_class_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(CarryShareClass.objects.filter(legal_name="Share Class B").exists())

        carry_share_class = CarryShareClass.objects.get(legal_name="Share Class B")
        self.assertEqual(carry_share_class.common_name, "Class B")
        self.assertEqual(carry_share_class.company, self.company)

    def test_retrieve_carry_share_class(self):
        carry_share_class = CarryShareClass.objects.create(
            company=self.company,
            legal_name="Share Class C",
            common_name="Class C",
            description="C share class"
        )

        url = reverse('carry-share-class-update', args=[carry_share_class.id])
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['legal_name'], "Share Class C")
        self.assertEqual(response.data['common_name'], "Class C")
