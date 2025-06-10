from rest_framework.fields import CharField
from rest_framework.serializers import ModelSerializer
from api.feature_flags.models import CompanyFeatureFlag, Feature


class FeatureSerializer(ModelSerializer):
    class Meta:
        model = Feature
        fields = "__all__"


class CompanyFeatureFlagSerializer(ModelSerializer):

    feature = FeatureSerializer()
    company_name = CharField(source="company.name")

    class Meta:
        model = CompanyFeatureFlag
        fields = "__all__"
