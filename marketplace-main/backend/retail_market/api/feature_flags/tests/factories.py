import factory
from factory import SubFactory

from api.feature_flags.models import Feature, CompanyFeatureFlag
from api.partners.tests.factories import CompanyFactory


class FeatureFactory(factory.django.DjangoModelFactory):
    name = "Some feature"
    description = "The description for my test feature"

    class Meta:
        model = Feature


class ActiveCompanyFeatureFactory(factory.django.DjangoModelFactory):
    feature = SubFactory(FeatureFactory)
    company = SubFactory(CompanyFactory)
    active = True

    class Meta:
        model = CompanyFeatureFlag


class InactiveCompanyFeatureFactory(factory.django.DjangoModelFactory):
    feature = SubFactory(FeatureFactory)
    company = SubFactory(CompanyFactory)
    active = False

    class Meta:
        model = CompanyFeatureFlag
