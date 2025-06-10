from django.urls import path
from api.page_configs import views

urlpatterns = [
    path(
        'onboarding-custom-text',
        views.OnboardingCustomText.as_view(),
        name="retrieve-onboarding-custom-text"
    ),
    path(
        '<page>',
        views.PageConfigAPIView.as_view(),
        name="retrieve-investor-dashboard-page-config"
    ),
]
