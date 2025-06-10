from django.urls import path
from api.tax_records.views import tax_records
from api.tax_records.views import tax_forms


urlpatterns = [
    path('<fund_external_id>', tax_records.TaxRecordCreateAPIView.as_view(), name="tax-records-list-create"),
    path('<tax_record_id>/tax_documents/create_envelope', tax_records.TaxDocumentCreateAPIView.as_view(), name='create-envelope-view'),
    path('<fund_external_id>/tax_documents/<envelope_id>', tax_records.SaveFormAPIView.as_view(), name='save-tax-document-view'),
    path('<tax_record_id>/tax_documents/', tax_records.TaxDocumentListAPIView.as_view(), name='list-tax-document-view'),
    path('<tax_record_id>/documents/<document_id>', tax_records.TaxDocumentDeleteAPIView.as_view( ), name='tax-document-delete-view'),
    path('<fund_external_id>/tax_forms/', tax_forms.TaxFormListAPIView.as_view(), name='list-tax-form-view'),
    path('tax_forms/<envelope_id>/form_signing_url', tax_forms.SigningURLAPIView.as_view(), name='signing-url-tax-form-view'),
    path('tax-record/<uuid>/update', tax_records.UpdateTaxRecordView.as_view(), name='tax-records-update-view'),
    path('tax-record/<uuid>', tax_records.TaxRecordListAPIView.as_view(), name='tax-records-list-view'),
    path('<fund_external_id>/tax-record/workflow', tax_records.CreateTaxWorkflow.as_view(), name='create_tax_workflow'),
    path('<fund_external_id>/tax-record/<uuid>/task', tax_records.CreateTaxReviewTask.as_view(),
         name='save-tax-document-view'),
]
