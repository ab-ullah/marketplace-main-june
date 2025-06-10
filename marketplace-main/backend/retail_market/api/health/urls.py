from django.urls import re_path

from api.health.views.health_views import HealthAPIView

urlpatterns = [
    re_path(r'^$', HealthAPIView.as_view(), name='health-check'),
]