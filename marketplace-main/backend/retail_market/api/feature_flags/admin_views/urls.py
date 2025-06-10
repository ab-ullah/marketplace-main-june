from django.urls import path
from api.feature_flags.admin_views.views import CompanyFeatureFlagViewSet, AdminFeatureFlagView,\
    AdminFeatureFlagActivateview, AdminFeatureFlagDectivateview

ADMIN_FEATURE_FLAGS_VIEW = 'admin-feature-flags-view'
ADMIN_FEATURE_FLAGS_ACTIVATE_VIEW = 'admin-feature-flags-activate-view'
ADMIN_FEATURE_FLAGS_DEACTIVATE_VIEW = 'admin-feature-flags-deactivate-view'
ADMIN_FEATURE_FLAGS_ENABLED_VIEW = 'admin-feature-flags-enabled-view'

urlpatterns = [
    path('', CompanyFeatureFlagViewSet.as_view(), name=ADMIN_FEATURE_FLAGS_VIEW),
    path('<str:feature_flag>/activate', AdminFeatureFlagActivateview.as_view(), name=ADMIN_FEATURE_FLAGS_ACTIVATE_VIEW),
    path('<str:feature_flag>/deactivate', AdminFeatureFlagDectivateview.as_view(), name=ADMIN_FEATURE_FLAGS_DEACTIVATE_VIEW),
    path('<str:feature_flag>', AdminFeatureFlagView.as_view(), name=ADMIN_FEATURE_FLAGS_ENABLED_VIEW),
]
