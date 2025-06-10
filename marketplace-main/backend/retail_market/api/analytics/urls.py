from django.urls import re_path

from api.analytics.views.analytics_views import AnalyticsFundInterestAPIView, AnalyticsEntityActionAPIView, AnalyticsFundInterestExportAPIView

urlpatterns = [
    re_path(r'^fund/(?P<slug>.+)/indication-of-interest$', AnalyticsFundInterestAPIView.as_view(), name='analytics-fund-interest'),
    re_path(r'^fund/(?P<slug>.+)/indication-of-interest/(?P<fund_id>.+)/export', AnalyticsFundInterestExportAPIView.as_view(), name='analytics-fund-interest-export'),
    re_path(r'^entity/action$', AnalyticsEntityActionAPIView.as_view(), name='analytics-create-entity-action'),
]
