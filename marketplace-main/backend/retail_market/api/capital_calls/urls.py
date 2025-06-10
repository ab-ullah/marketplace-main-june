from django.urls import re_path

from api.capital_calls.views.capital_call_views import CapitalCallCreateAPIView, CapitalCallRetrieveAPIView

urlpatterns = [
    re_path(r'^$', CapitalCallCreateAPIView.as_view(), name='capital-call-list-create'),
    re_path(r'^(?P<uuid>.+)$', CapitalCallRetrieveAPIView.as_view(), name='capital-call-update'),
]
