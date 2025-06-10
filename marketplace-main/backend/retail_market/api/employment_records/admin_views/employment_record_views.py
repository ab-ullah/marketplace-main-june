from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView

from api.employment_records.models import EmploymentRecord
from api.employment_records.serializers import EmploymentRecordSerializer
from api.mixins.admin_view_mixin import AdminViewMixin


class EmploymentRecordCreateAPIView(AdminViewMixin, CreateAPIView):
    queryset = EmploymentRecord.objects.all()
    serializer_class = EmploymentRecordSerializer


class EmploymentRecordRetrieveUpdateAPIView(AdminViewMixin, RetrieveUpdateAPIView):
    queryset = EmploymentRecord.objects.all()
    serializer_class = EmploymentRecordSerializer
