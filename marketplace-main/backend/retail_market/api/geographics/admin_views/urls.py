from django.urls import re_path

from api.geographics.admin_views.country_region_views import CountryRegionAPIView, IdDocumentTypeByCountry

urlpatterns = [
    re_path(r'^region_countries$', CountryRegionAPIView.as_view(), name='admin-region-country'),
    re_path(r'^country_id_documents$', IdDocumentTypeByCountry.as_view(), name='admin-id-documents-by-country'),
]
