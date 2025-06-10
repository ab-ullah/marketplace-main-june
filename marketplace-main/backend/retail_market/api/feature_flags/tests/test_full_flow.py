import json
from io import StringIO
from django.core.management import call_command

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.feature_flags.serializers import CompanyFeatureFlagSerializer
from api.feature_flags.admin_views.urls import ADMIN_FEATURE_FLAGS_VIEW
from api.feature_flags.urls import FEATURE_FLAGS_VIEW
from api.partners.tests.factories import UserFactory, CompanyFactory
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.reverse import reverse


class FeatureFlagManipulationMixin:

    def call_command(self, command, *args, **kwargs):
        out = StringIO()
        call_command(
            command,
            *args,
            stdout=out,
            stderr=StringIO(),
            **kwargs,
        )
        return out.getvalue()

    def call_activate_command(self, feature, company_id):
        return self.call_command("activate_company_feature_flag", company_id, feature)

    def call_deactivate_command(self, feature, company_id):
        return self.call_command("deactivate_company_feature_flag", company_id, feature)


class CompleteFlowTestCase(APITestCase, FeatureFlagManipulationMixin):

    def setUp(self):
        self.user = UserFactory()
        self.company = CompanyFactory.create()
        CreateAdminUserService(email=self.user.email, company_name=self.company.name).create()
        self.client.force_authenticate(self.user)

    def test_complete_flow(self):
        url = reverse('dummy-view')

        self.call_activate_command('A', self.company.id)

        res = self.client.get(url)
        self.assertEqual(status.HTTP_200_OK, res.status_code)
        content = res.json()
        self.assertIn('a_happened', content)
        self.assertIn('b_happened', content)
        self.assertTrue(content['a_happened'])
        self.assertFalse(content['b_happened'])

        self.call_deactivate_command('A', self.company.id)

        res = self.client.get(url)
        self.assertEqual(status.HTTP_200_OK, res.status_code)
        content = res.json()
        self.assertIn('a_happened', content)
        self.assertIn('b_happened', content)
        self.assertFalse(content['a_happened'])
        self.assertFalse(content['b_happened'])

        features_url = reverse(ADMIN_FEATURE_FLAGS_VIEW)
        res_features = self.client.get(features_url)
        self.assertEqual(status.HTTP_200_OK, res_features.status_code)
        content = res_features.json()
        self.assertEqual(len(content), 1)

        validated_feature = CompanyFeatureFlagSerializer(data=content[0])
        self.assertTrue(validated_feature.is_valid())
        self.assertEqual(validated_feature.validated_data['feature']['name'], 'A')
        self.assertEqual(validated_feature.validated_data['company'].id, self.company.id)
        self.assertFalse(validated_feature.validated_data['active'])

        list_command_res = self.call_command('list_company_feature_flags', self.company.id)
        decoded_json = json.loads(list_command_res)

        self.assertEqual(decoded_json['feature']['name'], validated_feature.validated_data['feature']['name'])
        self.assertEqual(decoded_json['company'], validated_feature.validated_data['company'].id)
        self.assertEqual(decoded_json['company_name'], validated_feature.validated_data['company'].name)
        self.assertEqual(decoded_json['active'], validated_feature.validated_data['active'])

    def test_check_feature_flag_through_api(self):
        self.call_activate_command('A', self.company.id)

        features_url = reverse(FEATURE_FLAGS_VIEW, kwargs={'feature_flag': "A"})
        response = self.client.get(features_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('feature_flag', data)
        self.assertIn('is_active', data)

        self.assertEqual(data['feature_flag'], "A")
        self.assertTrue(data['is_active'])

        self.call_deactivate_command('A', self.company.id)
        response = self.client.get(features_url)
        data = response.json()
        self.assertFalse(data['is_active'])
