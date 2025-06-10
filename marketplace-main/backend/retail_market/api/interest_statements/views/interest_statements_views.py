
from django.views import View
from django.http import HttpResponse
from api.interest_statements.services.interest_statement_service import InterestStatementService

class CreateInterestStatementsApiView(View):

    def __init__(self):
        self.interest_statement_svc = InterestStatementService()

    def post(self, request, **kwargs):
        uploaded_file = request.FILES.get('file', '')

        # Temporarily hardcoded
        process_name = 'Default Process Name'
        output_content_type = 'application/json'
        created_by = 'Admin User'

        # TODO: Make an async call to the method
        process_id = self.interest_statement_svc.start_processing_file(uploaded_file, process_name, output_content_type, created_by)

        location = '/interest-statements/load-transactions-process/{}'.format(process_id)
        response = HttpResponse(status=202, headers={'Location': location})
        return response
