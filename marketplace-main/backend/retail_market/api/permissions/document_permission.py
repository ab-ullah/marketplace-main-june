from rest_framework import permissions

from api.documents.models import Document
from api.documents.permissions import get_document_permission_from_request


class HasDocumentAccessPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj: Document):
        if not request.user.is_authenticated:
            return False

        return get_document_permission_from_request(
            document=obj,
            request=request
        )
