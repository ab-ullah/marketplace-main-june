from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from api.companies.models import CompanyToken
from api.companies.serializers import CompanyTokenSerializer
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class CompanyTokenListCreateAPIView(ListCreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CompanyTokenSerializer
    queryset = CompanyToken.objects.all()


class CompanyTokenRetrieveUpdateDeleteAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = CompanyTokenSerializer
    queryset = CompanyToken.objects.all()
