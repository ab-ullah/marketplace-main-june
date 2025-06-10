from django.urls import re_path

from api.feature_flags.admin_views.dummy import DummyView

urlpatterns = [
    re_path(r'^$', DummyView.as_view(), name='dummy-view'),
]
