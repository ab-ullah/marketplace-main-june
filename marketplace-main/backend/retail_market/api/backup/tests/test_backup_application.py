import json
from io import StringIO

from django.apps import apps
from django.core.management import call_command
from api.backup.models import ApplicationBackup
from api.backup.tests.test_backup_fund import CompleteApplication


class BackupInvestorApplicationTest(CompleteApplication):

    def setUp(self):
        self.create_user()
        self.create_currency()
        self.create_countries()
        self.client.force_authenticate(self.user)
        self.create_fund(company=self.company)
        self.create_card_workflow(self.company)
        self.create_eligibility_criteria_for_fund()
        self.setup_complete_application()
        self.document_api = apps.get_app_config('documents').document_api
        self.context = apps.get_app_config('documents').context

    def call_command(self, *args, **kwargs):
        out = StringIO()
        call_command(
            "backup_application",
            *args,
            stdout=out,
            stderr=StringIO(),
            **kwargs,
        )
        return out.getvalue()

    def test_regular_backup_run(self):
        out = self.call_command(self.application.id)
        decoded = json.loads(out)
        self.assertEqual(decoded['message'], "Successful")
        self.assertIsNotNone(decoded['backup_id'])
        self.assertIsNotNone(decoded['backup_key'])
        prefix = decoded['prefix']
        object_key = decoded['backup_key']
        self.assertIn(prefix, object_key)
        backup = ApplicationBackup.objects.get(pk=decoded['backup_id'])
        obj = self.document_api.get_obj(context=self.context, key=object_key)
        data = json.loads(obj["Body"].read())
        self.assertEqual(self.application.id, backup.application.id)
        self.assertEqual(self.application.id, data['id'])
