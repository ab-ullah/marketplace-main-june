from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from api.carry_pools.models import CarryVehicle, CarryShareClass
from api.carry_pools.serializers import CarryVehicleSerializer, CarryShareClassSerializer
from api.mixins.admin_view_mixin import AdminViewMixin


class CarryVehicleCreateAPIView(AdminViewMixin, ListCreateAPIView):
    serializer_class = CarryVehicleSerializer
    queryset = CarryVehicle.objects.all()


class CarryVehicleRetrieveUpdateAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = CarryVehicleSerializer
    queryset = CarryVehicle.objects.all()


class CarryShareClassCreateAPIView(AdminViewMixin, ListCreateAPIView):
    serializer_class = CarryShareClassSerializer
    queryset = CarryShareClass.objects.all()


class CarryShareClassRetrieveUpdateAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = CarryShareClassSerializer
    queryset = CarryShareClass.objects.all()
