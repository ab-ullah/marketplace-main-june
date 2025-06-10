import json

from django.urls import reverse
from rest_framework import status

from api.applications.tests.factories import ApplicationFactory
from api.comments.models import ApplicationComment, ModuleChoices, ApplicationCommentReply
from api.geographics.models import Country
from api.payments.tests.factories import PaymentDetailFactory
from api.partners.tests.factories import UserFactory
from core.base_tests import BaseTestCase


class ApplicationCommentTestCase(BaseTestCase):

    def setUp(self):
        self.create_user()
        self.create_currency()
        self.create_countries()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)
        self.application = ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=self.user
        )
        self.country = Country.objects.get(iso_code='US')
        self.payment_detail_1 = PaymentDetailFactory(
            currency=self.currency,
            user=self.user,
            bank_country=self.country
        )

        self.comment_1 = ApplicationComment.objects.create(
            module=ModuleChoices.BANKING_DETAILS,
            module_id=self.payment_detail_1.id,
            question_identifier='postal_code',
            application=self.application,
            comment_for=self.user,
            company=self.company
        )

        self.payment_detail_2 = PaymentDetailFactory(
            currency=self.currency,
            user=self.user,
            bank_country=self.country
        )
        self.comment_2 = ApplicationComment.objects.create(
            module=ModuleChoices.BANKING_DETAILS,
            module_id=self.payment_detail_2.id,
            question_identifier='postal_code',
            application=self.application,
            comment_for=self.user,
            company=self.company
        )

    def test_application_comment_status_update(self):
        url = reverse('payment-detail-update-api-view', kwargs={"pk": self.payment_detail_1.pk})

        payload = {"bank_name": "bank name", "street_address": "street address", "city": "city",
                   "postal_code": "postal code", "account_name": " account name", "account_number": "account number",
                   "credit_account_name": "credit account name", "credit_account_number": "credit account number",
                   "reference": "reference", "user": self.user.id, "bank_country": self.country.id,
                   "currency": self.currency.id,
                   "state": "state", "routing_number": "test routing_number", "ach": "test ach"
                   }

        response = self.client.patch(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment_1.refresh_from_db()
        self.comment_2.refresh_from_db()
        self.assertEqual(self.comment_1.status, ApplicationComment.Statuses.UPDATED)
        self.assertEqual(self.comment_2.status, ApplicationComment.Statuses.CREATED)

    def test_update_comments_by_module_id_view(self):
        url = reverse('update-comments-status-for-module')
        payload = {'module': ModuleChoices.BANKING_DETAILS, 'module_id': self.payment_detail_2.id}
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.comment_1.refresh_from_db()
        self.comment_2.refresh_from_db()
        self.assertEqual(self.comment_1.status, ApplicationComment.Statuses.CREATED)
        self.assertEqual(self.comment_2.status, ApplicationComment.Statuses.UPDATED)

    def test_comment_bulk_update(self):

        user_1 = UserFactory()

        application_1 = ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=user_1
        )

        payment_detail_1 = PaymentDetailFactory(
            currency=self.currency,
            user=user_1,
            bank_country=self.country
        )

        postal_code_comment_application_1 = ApplicationComment.objects.create(
            module=ModuleChoices.BANKING_DETAILS,
            module_id=payment_detail_1.id,
            question_identifier='postal_code',
            application=application_1,
            comment_for=user_1,
            company=self.company
        )

        postal_code_comment_1 = ApplicationComment.objects.create(
            module=ModuleChoices.BANKING_DETAILS,
            module_id=self.payment_detail_2.id,
            question_identifier='postal_code',
            application=self.application,
            comment_for=self.user,
            company=self.company
        )

        postal_code_comment_2 = ApplicationComment.objects.create(
            module=ModuleChoices.BANKING_DETAILS,
            module_id=self.payment_detail_2.id,
            question_identifier='postal_code',
            application=self.application,
            comment_for=self.user,
            company=self.company
        )

        account_name_comment = ApplicationComment.objects.create(
            module=ModuleChoices.BANKING_DETAILS,
            module_id=self.payment_detail_2.id,
            question_identifier='account_name',
            application=self.application,
            comment_for=self.user,
            company=self.company
        )

        url = reverse('admin-comment-update-view', kwargs={"pk": postal_code_comment_1.pk})
        payload = {"status": ApplicationComment.Statuses.RESOLVED}
        self.client.force_authenticate(self.admin_user.user)
        self.client.patch(
            url,
            data=json.dumps(payload),
            content_type='application/json',
        )
        postal_code_comment_1.refresh_from_db()
        postal_code_comment_2.refresh_from_db()
        account_name_comment.refresh_from_db()

        # assert that comments for same field are resolved
        self.assertEqual(postal_code_comment_1.status, ApplicationComment.Statuses.RESOLVED)
        self.assertEqual(postal_code_comment_2.status, ApplicationComment.Statuses.RESOLVED)
        # assert that comment for other fields are not resolved
        self.assertEqual(account_name_comment.status, ApplicationComment.Statuses.CREATED)
        # assert that comments for same field on different application are not resolved
        self.assertEqual(postal_code_comment_application_1.status, ApplicationComment.Statuses.CREATED)

    def test_comment_reply(self):
        self.client.force_authenticate(self.admin_user.user)
        reply = ApplicationCommentReply.objects.create(
            text='Test reply', comment=self.comment_1, reply_by=self.user
        )
        url = reverse('admin-comment-retrieve-update-view', kwargs={"pk": self.comment_1.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['replies']), 1)
        self.assertEqual(response.data['replies'][0]['text'], reply.text)


class ApplicationCommentReplyTestCase(BaseTestCase):

    def setUp(self):
        self.create_user()
        self.create_currency()
        self.create_countries()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)
        self.application = ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=self.user
        )
        self.country = Country.objects.get(iso_code='US')
        self.payment_detail = PaymentDetailFactory(
            currency=self.currency,
            user=self.user,
            bank_country=self.country
        )

        self.comment = ApplicationComment.objects.create(
            module=ModuleChoices.BANKING_DETAILS,
            module_id=self.payment_detail.id,
            question_identifier='postal_code',
            application=self.application,
            comment_for=self.user,
            company=self.company
        )

    def test_comment_reply(self):
        reply_text = 'Test reply'
        url = reverse('comment-reply-list-create-view', kwargs={'comment_id': self.comment.pk})

        # assert post reply
        response = self.client.post(url, data={'text': reply_text})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(reply_text, response.data['text'])

        # assert list replies
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['text'], reply_text)

    def test_update_reply(self):
        updated_text = 'Updated test reply'
        reply = ApplicationCommentReply.objects.create(
            text='Test reply', comment=self.comment, reply_by=self.user
        )
        url = reverse('comment-reply-retrieve-update-view', kwargs={'comment_id': self.comment.pk, 'pk': reply.id})

        # assert post reply
        response = self.client.patch(url, data={'text': updated_text})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(updated_text, response.data['text'])

        reply.refresh_from_db()
        self.assertEqual(reply.text, updated_text)
