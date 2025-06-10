from django.urls import path, re_path

from api.cards.admin_views.views import FundWorkflowsListView

urlpatterns = [
    path('funds/<fund_external_id>/', FundWorkflowsListView.as_view({'get':'list'}), name="admin-fund-workflows-list")
]
