from django.urls import path

from .start_sync_views import StartPushToRecord

START_PUSH_TO_BOOKS_VIEW = 'start-push-view'

urlpatterns = [
    path('book_pushes', StartPushToRecord.as_view(), name=START_PUSH_TO_BOOKS_VIEW),
]
