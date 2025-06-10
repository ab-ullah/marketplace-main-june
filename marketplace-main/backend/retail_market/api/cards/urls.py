from rest_framework import routers
from django.urls import path, include
from api.cards.views.workflow_views import CreateCardView
from api.cards.views.workflow_views import FundWorkflowsCreateView, FundWorkflowsListView

urlpatterns = [
    path('funds/<fund_external_id>/', FundWorkflowsListView.as_view({'get':'list'}), name="fund-workflows-list"),
    path('funds/<fund_external_id>/workflows/', FundWorkflowsCreateView.as_view({'post':'create'}), name="fund-workflows-create"),
    path('<wf_slug>/cards/', CreateCardView.as_view({'post':'create'}), name="fund-workflows-list")
]