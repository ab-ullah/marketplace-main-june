from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from api.feature_flags.provider import FeatureFlagProvider
from api.mixins.company_user_mixin import CompanyUserViewMixin


class FeatureFlagView(CompanyUserViewMixin, APIView):
    def get(self, request, feature_flag):
        provider = FeatureFlagProvider.from_params(company_ids=self.company_ids)
        return Response({'feature_flag': feature_flag, 'is_active': provider.is_active(feature_flag)},
                        status=status.HTTP_200_OK)
