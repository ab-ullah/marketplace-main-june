from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.feature_flags.provider import FeatureFlagProvider
from api.feature_flags.serializers import CompanyFeatureFlagSerializer
from api.feature_flags.models import CompanyFeatureFlag
from api.mixins.admin_view_mixin import AdminViewMixin


class CompanyFeatureFlagViewSet(AdminViewMixin, ListAPIView, RetrieveAPIView):
    queryset = CompanyFeatureFlag.objects.all().select_related('company', 'feature')
    serializer_class = CompanyFeatureFlagSerializer


class AdminFeatureFlagView(AdminViewMixin, APIView):
    def get(self, request, feature_flag):
        provider = FeatureFlagProvider.from_params(company_ids=self.company_ids)
        return Response({'feature_flag': feature_flag, 'is_active': provider.is_active(feature_flag)},
                        status=status.HTTP_200_OK)


class AdminFeatureFlagActivateview(AdminViewMixin, APIView):
    def put(self, request, feature_flag):
        provider = FeatureFlagProvider.from_params(company_id=self.company.id)
        provider.activate(feature_flag)
        return Response({'feature_flag': feature_flag, 'is_active': provider.is_active(feature_flag)},
                        status=status.HTTP_200_OK)


class AdminFeatureFlagDectivateview(AdminViewMixin, APIView):
    def put(self, request, feature_flag):
        provider = FeatureFlagProvider.from_params(company_id=self.company.id)
        provider.deactivate(feature_flag)
        return Response({'feature_flag': feature_flag, 'is_active': provider.is_active(feature_flag)},
                        status=status.HTTP_200_OK)
