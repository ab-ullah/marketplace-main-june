from django.urls import re_path

from api.investors.admin_views.document_views import CreateFundDocumentAPIView, CreateInvestorDocumentAPIView, \
    UpdateInvestorDocumentAPIView, DestroyFundInvestorDocumentAPIView, InvestorDocumentsListAPIView, \
    InvestorDocumentFiltersAPIView
from api.investors.admin_views.investor_users import InvestorUsersListAPIView, InvestorsListAPIView, \
    ConsiderationsInvestorUsersListAPIView

urlpatterns = [
    re_path(r'^users/$', InvestorUsersListAPIView.as_view(), name='investor-users-list'),
    re_path(
        r'^consideration-users/$', ConsiderationsInvestorUsersListAPIView.as_view(), name='consideration-investor-users-list'),
    re_path(r'^investors/$', InvestorsListAPIView.as_view(), name='investor-list'),
    re_path(r'^fund-document/$', CreateFundDocumentAPIView.as_view(), name='create-fund-document'),
    re_path(r'^investor-document/$', CreateInvestorDocumentAPIView.as_view(), name='create-investor-document'),
    re_path(r'^investor-document/update/(?P<document_id>[0-9a-f-]+)$', UpdateInvestorDocumentAPIView.as_view(), name='update-investor-document'),
    re_path(r'^(?P<document_type>.+)/delete/(?P<pk>\d+)$', DestroyFundInvestorDocumentAPIView.as_view(), name='delete-investor-document'),
    re_path(r'^documents/$', InvestorDocumentsListAPIView.as_view(), name='list-investor-documents'),
    re_path(r'^document-filters/$', InvestorDocumentFiltersAPIView.as_view(), name='investor-document-filters'),
]
