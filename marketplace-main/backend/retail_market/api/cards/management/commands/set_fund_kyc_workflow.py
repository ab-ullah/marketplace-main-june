from django.core.management.base import BaseCommand

from api.cards.default.lasalle_no_proof_of_address.workflows import WorkflowTypes, create_workflow_for_fund
from api.funds.models import Fund

custom_workflows = {
    'lasalle-no-proof-of-address':
        {
            'types': WorkflowTypes,
            'create_func': create_workflow_for_fund
        }
}

class Command(BaseCommand):
    help = 'Set a fund specific kyc workflow'

    def add_arguments(self, parser):
        parser.add_argument('--fund_external_id', type=str, action='store')
        parser.add_argument('--workflow_name', type=str, action='store')

    def handle(self, *args, **options):
        external_id = options.get('fund_external_id')
        workflow_name = options.get('workflow_name')
        custom_workflow = custom_workflows.get(workflow_name)

        if custom_workflow is None:
            print("no workflow named {} found".format(workflow_name))
            print('available workflows are:')
            for val in custom_workflows.keys():
                print("\t{}".format(val))
            return

        fund = Fund.objects.get(external_id=external_id)

        for type in custom_workflow['types']:
            custom_workflow['create_func'](fund, type)