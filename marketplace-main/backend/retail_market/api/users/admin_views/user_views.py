from rest_framework.generics import ListAPIView, DestroyAPIView, UpdateAPIView, CreateAPIView

from api.mixins.admin_view_mixin import AdminViewMixin
from api.users.models import RetailUser
from api.users.selectors.users_in_company_selector import get_users_in_company, get_admin_users_in_company
from api.users.serializers import RetailUserListSerializer, UserCreateSerializer


class UsersListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = RetailUserListSerializer

    def get_queryset(self):
        return get_users_in_company(company=self.company)


class UserCreateAPIView(AdminViewMixin, CreateAPIView):
    serializer_class = UserCreateSerializer


class UserDeleteAPIView(AdminViewMixin, DestroyAPIView):
    def get_queryset(self):
        return get_users_in_company(company=self.company)

    def perform_destroy(self, instance: RetailUser):
        instance.deleted = True
        instance.save()


class AllUsersListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = RetailUserListSerializer

    def get_queryset(self):
        return get_admin_users_in_company(company=self.company)


class UpdateUserAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = RetailUserListSerializer

    def get_queryset(self):
        return get_admin_users_in_company(company=self.company)
