from django.urls import re_path, path

from api.geographics.views.country_region_views import CountryRegionAPIView
from api.geographics.views.country_views import CountryIdDocumentTypesRetrieveAPIView, CountryStatesAPIView, CountriesListApiView

urlpatterns = [
    re_path(r'^region_countries/(?P<fund_external_id>.+)$', CountryRegionAPIView.as_view(), name='region-country'),
    path(
        '<country_code>/id_documents',
        CountryIdDocumentTypesRetrieveAPIView.as_view(),
        name='valid-id_documents-by-country'),
    path('countries/<country_id>/states', CountryStatesAPIView.as_view(), name='states-by-country'),
    path('countries', CountriesListApiView.as_view(), name='countries')
]
