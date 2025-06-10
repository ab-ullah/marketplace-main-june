from django.urls import path
from api.feature_flags.views import FeatureFlagView

FEATURE_FLAGS_VIEW = 'feature-flags-view'

urlpatterns = [
    path('<str:feature_flag>', FeatureFlagView.as_view(), name=FEATURE_FLAGS_VIEW),
]
