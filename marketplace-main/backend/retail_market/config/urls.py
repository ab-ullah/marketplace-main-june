"""retail_market URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/analytics/', include('api.analytics.urls')),
    path('api/funds/', include('api.funds.urls')),
    path('api/investors/', include('api.investors.urls')),
    path('api/companies/', include('api.companies.urls')),
    path('api/users/', include('api.users.urls')),
    path('api/admin_users/', include('api.admin_users.urls')),
    path('api/notifications/', include('api.notifications.urls')),
    path('api/capital_calls/', include('api.capital_calls.urls')),
    path('api/documents/', include('api.documents.urls')),
    path('api/interest_statements/', include('api.interest_statements.urls')),
    path('api/currencies/', include('api.currencies.urls')),
    path('api/eligibility_criteria/', include('api.eligibility_criteria.urls')),
    path('api/geographics/', include('api.geographics.urls')),
    path('api/fund_marketing_pages/', include('api.fund_marketing_pages.urls')),
    path('api/workflows/', include('api.workflows.urls')),
    path('api/health/', include('api.health.urls')),
    path('api/workflows/', include('api.cards.urls')),
    path('api/kyc_records/', include('api.kyc_records.urls')),
    path('api/comments/', include('api.comments.urls')),
    path('partners/', include('api.partners.urls')),
    path('api/payments/', include('api.payments.urls')),
    path('api/tax_records/', include('api.tax_records.urls')),
    path('api/applications/', include('api.applications.urls')),
    path('api/agreements/', include('api.agreements.urls')),
    path('api/page_configs/', include('api.page_configs.urls')),
    path('api/feature_flags/', include('api.feature_flags.urls')),
    path('api/carry_plans/', include('api.carry_pools.urls')),
    path('api/notices/', include('api.notices.urls')),
    path('api/total_compensation', include('api.compensation_records.urls')),
    # Admin API Views
    path('api/admin/users/', include('api.users.admin_views.urls')),
    path('api/admin/comments/', include('api.comments.admin_views.urls')),
    path('api/admin/capital_calls/', include('api.capital_calls.admin_views.urls')),
    path('api/admin/distribution_notices/', include('api.distribution_notices.admin_views.urls')),
    path('api/admin/agreements/', include('api.agreements.admin_views.urls')),
    path('api/admin/currencies/', include('api.currencies.admin_views.urls')),
    path('api/admin/funds/', include('api.funds.admin_views.urls')),
    path('api/admin/eligibility_criteria/', include('api.eligibility_criteria.admin_views.urls')),
    path('api/admin/geographics/', include('api.geographics.admin_views.urls')),
    path('api/admin/tax_records/', include('api.tax_records.admin_views.urls')),
    path('api/admin/applications/', include('api.applications.admin_views.urls')),
    path('api/admin/kyc_records/', include('api.kyc_records.admin_views.urls')),
    path('api/admin/companies/', include('api.companies.admin_views.urls')),
    path('api/admin/workflows/', include('api.cards.admin_views.urls')),
    path('api/admin/investors/', include('api.investors.admin_views.urls')),
    path('api/admin/transfers/', include('api.transfers.admin_views.urls')),
    path('api/admin/carry_pools/', include('api.carry_pools.admin_views.urls')),
    path('api/admin/feature_flags/', include('api.feature_flags.admin_views.urls')),
    path('api/admin/notices/', include('api.notices.admin_views.urls')),
    path('api/admin/backups/', include('api.backup.admin_views.urls')),
    path('api/admin/employees/', include('api.employment_records.admin_views.urls')),
    path('api/admin/payment_detail/', include('api.payments.admin_views.urls')),
]

if settings.DEBUG:
    import debug_toolbar

    urlpatterns += [path('__debug__/', include(debug_toolbar.urls)), ]

if settings.IS_TEST_RUN:
    urlpatterns += [path('api/tests/', include('api.feature_flags.admin_views.urls_dummy'))]
