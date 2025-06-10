from django.urls import re_path

from api.documents.views.document_views import FileDownloadView, DocumentDeleteAPIView

urlpatterns = [
    re_path(r'^(?P<pk>\d+)$', DocumentDeleteAPIView.as_view(), name='document-delete'),
    re_path(r'^(?P<document_id>[0-9a-f-]+)$', FileDownloadView.as_view(), name='document-download')
]
