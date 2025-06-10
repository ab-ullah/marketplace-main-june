from django.urls import re_path

from api.companies.views.company_token_views import CompanyTokenListCreateAPIView, \
    CompanyTokenRetrieveUpdateDeleteAPIView
from api.companies.views.company_user_views import CompanyUsersListView, CompanyUserPowerOfAttorneyCreateView
from api.companies.views.company_views import CompanyRetrieveAPIView, CompanyByFundSlugRetrieveAPIView, \
    CompanyThemeRetrieveAPIView
from api.companies.views.company_views import CompanyListAPIView, CompanyVehicleListView

urlpatterns = [
    re_path(r'^$', CompanyListAPIView.as_view(), name='company-list-view'),
    re_path(r'^(?P<company_slug>.+)/theme$', CompanyThemeRetrieveAPIView.as_view(), name='company-theme-retrieve-view'),
    re_path(r'^by-fund/(?P<fund_external_id>.+)$', CompanyByFundSlugRetrieveAPIView.as_view(), name='company-by-fund-view'),
    re_path(
        r'^users/by-fund/(?P<fund_external_id>.+)/attorney-document$',
        CompanyUserPowerOfAttorneyCreateView.as_view(),
        name='power-of-attorney-document'
    ),
    re_path(r'^users$', CompanyUsersListView.as_view(), name='company-users-list-view'),
    re_path(r'^(?P<slug>.+)/profile$', CompanyRetrieveAPIView.as_view(), name='company-profile-view'),
    re_path(r'^tokens$', CompanyTokenListCreateAPIView.as_view(), name='company-tokens-list-create-view'),
    re_path(
        r'^tokens/(?P<pk>\d+)$',
        CompanyTokenRetrieveUpdateDeleteAPIView.as_view(),
        name='company-tokens-update-view'
    ),
    re_path(r'^vehicles', CompanyVehicleListView.as_view(), name='company-vehicles-list-view'),
]
