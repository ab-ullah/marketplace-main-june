from django.urls import path
from api.tax_records.admin_views import tax_records

urlpatterns = [
    path('', tax_records.TaxRecordsListAPIView.as_view(), name='admin-list-tax-records-view'),
    path('tax-forms', tax_records.TaxFormsListAPIView.as_view(), name='admin-tax-forms-list-view'),
    path('<record_id>/documents/', tax_records.TaxDocumentListAPIView.as_view(), name='admin-list-tax-documents-view'),
    path('documents/create', tax_records.CreateTaxDocumentAPIView.as_view(),
         name='admin-create-tax-documents-view'),
    path('<record_id>/documents/all', tax_records.AllTaxDocumentListAPIView.as_view(),
         name='admin-list-all-tax-documents-view'),
    path('<record_id>/documents/<pk>/application/<application_id>', tax_records.TaxDocumentUpdateAPIView.as_view(),
         name='admin-update-tax-documents-view'),
    path('<pk>/tax-details/', tax_records.TaxRecordRetrieveAPIView.as_view(), name='admin-fetch-tax-details'),
]
