from rest_framework.test import APITestCase

from api.feature_flags.provider import FeatureFlagProvider
from api.feature_flags.tests.factories import FeatureFactory, ActiveCompanyFeatureFactory, InactiveCompanyFeatureFactory
from api.partners.tests.factories import CompanyFactory


class SomeBusinessFlowService:
    def __init__(self, company, feature_flag_provider):
        self.company = company
        self.feature_flag_provider = feature_flag_provider

    def do_something(self):
        a_happened = False
        b_happened = False
        if self.feature_flag_provider.is_active("A"):
            a_happened = True
        if self.feature_flag_provider.is_active("B"):
            b_happened = True
        return a_happened, b_happened


class CompleteFeatureFlagProvider(APITestCase):
    def setUp(self) -> None:
        self.feature_a = FeatureFactory.create(name="A")
        self.feature_b = FeatureFactory.create(name="B")
        self.company_1 = CompanyFactory.create()
        self.company_2 = CompanyFactory.create()
        self.company_feature_a_1 = ActiveCompanyFeatureFactory.create(feature=self.feature_a, company=self.company_1)
        self.company_feature_b_1 = InactiveCompanyFeatureFactory.create(feature=self.feature_b, company=self.company_1)
        self.company_feature_a_2 = InactiveCompanyFeatureFactory.create(feature=self.feature_a, company=self.company_2)

    def test_flow_inactive_then_active(self):
        feature_flag_provider = FeatureFlagProvider.model_validate({'company_id': self.company_1.id})
        my_service = SomeBusinessFlowService(self.company_1, feature_flag_provider)
        result_a, result_b = my_service.do_something()
        self.assertTrue(result_a)
        self.assertFalse(result_b)

        feature_flag_provider.activate("B")

        result_a, result_b = my_service.do_something()
        self.assertTrue(result_a)
        self.assertTrue(result_b)
