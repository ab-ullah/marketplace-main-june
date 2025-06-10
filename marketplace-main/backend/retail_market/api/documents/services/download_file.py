import io

from django.http import HttpResponse

from api.documents.models import Document
from django.apps import apps


def download_file_obj(document: Document):
    config = apps.get_app_config('documents')
    context = config.context
    document_api = config.document_api

    file_obj = document_api.get_obj(context, document.document_path)
    return file_obj['Body']
