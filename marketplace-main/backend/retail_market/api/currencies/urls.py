from django.urls import re_path

from api.currencies.views.currency_views import CompanyCurrencyListAPIView, FundCurrencyListAPIView

urlpatterns = [
    re_path(r'^$', CompanyCurrencyListAPIView.as_view(), name='company-currency-list-api-view'),
    re_path(r'^fund/(?P<fund_external_id>.+)$', FundCurrencyListAPIView.as_view(), name='fund-company-currency-list-api-view'),
]