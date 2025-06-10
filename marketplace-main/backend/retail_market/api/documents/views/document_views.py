from django.apps import apps
from django.http import HttpResponse
from rest_framework.generics import DestroyAPIView, RetrieveAPIView

from api.documents.models import Document
from api.permissions.document_permission import HasDocumentAccessPermission


class FileDownloadView(RetrieveAPIView):
    permission_classes = (HasDocumentAccessPermission,)
    lookup_url_kwarg = 'document_id'
    lookup_field = 'document_id'
    queryset = Document.objects.all()

    def retrieve(self, request, *args, **kwargs):
        document = self.get_object()
        config = apps.get_app_config('documents')
        context = config.context
        document_api = config.document_api
        response = HttpResponse(
            headers={
                'Content-type': document.content_type,
                'Content-Disposition': 'inline;filename="{}"'.format(document.file_name())
            }
        )
        document_api.get_fileobj(context, document.document_path, response)
        return response


class DocumentDeleteAPIView(DestroyAPIView):
    permission_classes = (HasDocumentAccessPermission,)
    queryset = Document.objects.all()

    def perform_destroy(self, instance: Document):
        instance.deleted = True
        instance.save()
