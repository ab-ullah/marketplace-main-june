from django.urls import re_path
from api.interest_statements.views.interest_statements_views import CreateInterestStatementsApiView


urlpatterns = [
    re_path(r'^$', CreateInterestStatementsApiView.as_view(), name='upload-file'),
]