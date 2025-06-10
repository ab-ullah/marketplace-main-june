from api.libs.user.user_helper import UserHelper
from api.users.utils.get_view_as_user import get_view_as_user, get_show_unpublished_funds, get_view_as_advisor


class CompanyUserViewMixin:

    @property
    def company_users(self):
        if client_user := get_view_as_advisor(request=self.request):
            return [client_user]
        if view_as_user := get_view_as_user(request=self.request):
            return [view_as_user]
        return UserHelper.get_company_users(self.request.user)

    @property
    def company_user_ids(self):
        return [company_user.id for company_user in self.company_users]

    @property
    def companies(self):
        return [company_user.company for company_user in self.company_users]

    @property
    def company_ids(self):
        return [company_user.company_id for company_user in self.company_users]

    @property
    def investor_ids(self):
        company_user_ids = self.company_user_ids
        return UserHelper.get_investor_ids(company_user_ids=company_user_ids)

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.filter(company_id__in=self.company_ids)
        return qs

    @property
    def data_user(self):
        company_users = self.company_users
        if company_users:
            return company_users[0].user
        return self.request.user

    @property
    def view_as_user(self):
        company_users = self.company_users
        if len(company_users) == 1:
            return company_users[0].user
        return self.request.user

    @property
    def show_unpublished_funds(self) -> bool:
        return get_show_unpublished_funds(request=self.request)

    @property
    def requested_user(self):
        if client_user := get_view_as_advisor(request=self.request):
            return client_user.user
        return self.request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['requested_user'] = self.requested_user
        return context
