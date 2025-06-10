from django.urls import re_path

from api.currencies.admin_views.currency_views import CompanyCurrencyListAPIView

urlpatterns = [
    re_path(r'^$', CompanyCurrencyListAPIView.as_view(), name='company-currency-list-api-view'),
]
