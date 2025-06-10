from django.urls import re_path

from api.partners.views.activity_views import FundActivityCreateAPIView, LoanActivityCreateAPIView, \
    FundActivityRegenerateAPIView, FundOnboardingDocumentCreateAPIView
from api.partners.views.currency_views import FundCurrencyCreateUpdateAPIView
from api.partners.views.document_views import FundDocumentCreateAPIView, InvestorDocumentCreateAPIView
from api.partners.views.fund_views import FundCreateAPIView, FundNavCreateAPIView
from api.partners.views.investor_views import InvestorCreateAPIView
from api.partners.views.kyc_views import KycRecordCreateAPIView, KycDocumentCreateAPIView, ApplicationDocumentCreateAPIView
from api.partners.views.power_of_attorney_views import PowerOfAttorneyCreateAPIView
from api.partners.views.transaction_detail_views import TransactionDetailCreateAPIView

urlpatterns = [
    re_path(r'^funds$', FundCreateAPIView.as_view(), name='partner-funds-create-api-view'),
    re_path(
        r'^funds/currencies$',
        FundCurrencyCreateUpdateAPIView.as_view(),
        name='funds-currency-rate-create-api-view'
    ),
    re_path(r'^funds/nav$', FundNavCreateAPIView.as_view(), name='funds-nav-create-api-view'),
    re_path(r'^funds/activities$', FundActivityCreateAPIView.as_view(), name='funds-activity-create-api-view'),
    re_path(r'^loans/activities$', LoanActivityCreateAPIView.as_view(), name='loans-activity-create-api-view'),
    re_path(r'^funds/files$', FundDocumentCreateAPIView.as_view(), name='funds-document-create-api-view'),
    re_path(r'^funds/on-boarding/files$', FundOnboardingDocumentCreateAPIView.as_view(), name="funds-on-boarding-create-api-view"),
    re_path(r'^investors$', InvestorCreateAPIView.as_view(), name='investment-create-api-view'),
    re_path(r'^investors/files$', InvestorDocumentCreateAPIView.as_view(), name='investor-document-create-api-view'),
    re_path(r'^funds/regenerate$', FundActivityRegenerateAPIView.as_view(), name='funds-activity-regenerate-api-view'),
    re_path(r'^transactions/details$', TransactionDetailCreateAPIView.as_view(), name='transaction-detail-create-api-view'),
    re_path(r'^kyc_record$', KycRecordCreateAPIView.as_view(), name='kyc-record-create-api-view'),
    re_path(r'^kyc_record/document$', KycDocumentCreateAPIView.as_view(), name='kyc-document-create-api-view'),

    re_path(r'^applications/document$', ApplicationDocumentCreateAPIView.as_view(), name='kyc-application-document-api-view'),
    re_path(
        r'^power-of-attorney$',
        PowerOfAttorneyCreateAPIView.as_view(),
        name='power-of-attorney-create-api-view'
    ),
]
