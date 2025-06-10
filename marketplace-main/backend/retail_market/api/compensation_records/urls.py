from django.urls import path

from api.compensation_records import views

INVESTOR_DASHBOARD_TOTAL_COMPENSATION_RECORDS_URL = "investor-dashboard-total-compensation-historical-records"
INVESTOR_DASHBOARD_LATEST_COMPENSATION_URL = "investor-dashboard-latest-compensation"

urlpatterns = [
    path(
        '',
        views.LatestCompensation.as_view(),
        name=INVESTOR_DASHBOARD_LATEST_COMPENSATION_URL
    ),
    path(
        '/history',
        views.TotalCompensationHistory.as_view(),
        name=INVESTOR_DASHBOARD_TOTAL_COMPENSATION_RECORDS_URL
    ),
]
