from django.urls import re_path

from api.investors.views.active_applications_views import \
    ActiveApplicationsAPIView
from api.investors.views.fund_investor_views import (
    FundInvestorListCreateAPIView, FundInvestorRetrieveUpdateDeleteAPIView,
    FundInvestorsListAPIView)
from api.investors.views.fund_order_views import (
    FundOrderListCreateAPIView, FundOrderRetrieveUpdateDeleteAPIView)
from api.investors.views.fund_sale_views import (
    FundSaleListCreateAPIView, FundSaleRetrieveUpdateDeleteAPIView)
from api.investors.views.investor_views import (InvestedFundCount,
                                                InvestorDetailAPIView,
                                                InvestorProfilesListAPIView, InvestorCarryDocumentsAPIView,
                                                InvestorAdvisorsListAPIView, InvestorAvailableCurrenciesView)
from api.investors.views.non_invested_opportunities import (
    NonInvestedCompanyOpportunitiesListAPIView,
    NonInvestedOpportunitiesListAPIView,
    PastOpportunitiesListAPIView)

urlpatterns = [
    re_path(r'^opportunities/$', NonInvestedOpportunitiesListAPIView.as_view(), name='investor-opportunities'),
    re_path(
        r'^past-opportunities/$',
        PastOpportunitiesListAPIView.as_view(),
        name='investor-past-opportunities'
    ),
    re_path(r'^invested-count/$', InvestedFundCount.as_view(), name='invested-fund-count'),
    re_path(r'^active-applications/$', ActiveApplicationsAPIView.as_view(), name='active-applications'),
    re_path(r'^stats/$', NonInvestedOpportunitiesListAPIView.as_view(), name='investor-opportunities'),
    re_path(
        r'^(?P<company_slug>.+)/non-invested-opportunities/$',
        NonInvestedCompanyOpportunitiesListAPIView.as_view(),
        name='non-invested-opportunities'
    ),
    re_path(r'^profiles/$', InvestorProfilesListAPIView.as_view(), name='investor-profiles'),
    re_path(r'^orders/$', FundOrderListCreateAPIView.as_view(), name='investor-orders'),
    re_path(r'^funds/$', FundInvestorListCreateAPIView.as_view(), name='fund-investors-list-create'),
    re_path(r'^funds/(?P<pk>\d+)$', FundInvestorRetrieveUpdateDeleteAPIView.as_view(), name='funds-investors-update'),
    re_path(r'^funds/(?P<fund_external_id>.+)/detail$', FundInvestorsListAPIView.as_view(), name='funds-investors-list'),
    re_path(r'^sales/$', FundSaleListCreateAPIView.as_view(), name='fund-sale-list-create'),
    re_path(r'^sales/(?P<pk>\d+)$', FundSaleRetrieveUpdateDeleteAPIView.as_view(), name='funds-sales-update'),
    re_path(r'^orders/$', FundOrderListCreateAPIView.as_view(), name='investor-orders'),
    re_path(r'^detail/$', InvestorDetailAPIView.as_view(), name='investor-detail'),
    re_path(r'^available-currencies/$', InvestorAvailableCurrenciesView.as_view(), name='available-currencies'),
    re_path(
        r'^orders/(?P<pk>\d+)$',
        FundOrderRetrieveUpdateDeleteAPIView.as_view(),
        name='update-order'
    ),
    re_path(r'^carry-documents/$', InvestorCarryDocumentsAPIView.as_view(), name='investor-carry-documents'),
    re_path(r'^advisors/$', InvestorAdvisorsListAPIView.as_view(), name='investor-advisors-list'),
]
