from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.notifications.tests.factories import NotificationFactory
from api.partners.tests.factories import CompanyFactory, UserFactory, CompanyUserFactory, CompanyUserInvestorFactory


class NotificationsAPITestCase(APITestCase):

    def setUp(self):
        self.company = CompanyFactory()
        self.user = UserFactory()
        self.user2 = UserFactory()

        self.client.force_authenticate(self.user)
        self.company_user = CompanyUserFactory(company=self.company, user=self.user)
        self.company_user2 = CompanyUserFactory(company=self.company, user=self.user2)

    def test_notification_list_view(self):
        notification_1 = NotificationFactory(company=self.company, user=self.company_user)
        notification_2 = NotificationFactory(company=self.company)
        notification_3 = NotificationFactory(company=self.company, user=self.company_user)

        url = reverse('notifications-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 0)

        notification_1.fund.is_published = True
        notification_1.fund.save()

        notification_2.fund.is_published = True
        notification_2.fund.save()

        notification_3.fund.is_published = True
        notification_3.fund.save()

        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 0)

        notification_1.fund.publish_investment_details = True
        notification_1.fund.save()

        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], notification_1.id)

    def test_notification_deduplication(self):
        investor1 = CompanyUserInvestorFactory(company_user=self.company_user)
        notification_1 = NotificationFactory(company=self.company, user=self.company_user)
        notification_2 = NotificationFactory(company=self.company, user=self.company_user2)

        notification_1.fund.publish_investment_details = True
        notification_1.fund.save()
        notification_2.fund.publish_investment_details = True
        notification_2.fund.save()

        notification_1.investor = investor1.investor
        notification_2.investor = investor1.investor
        notification_1.save()
        notification_2.save()

        url = reverse('notifications-list')
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], notification_1.id)
