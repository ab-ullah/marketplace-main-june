from api.workflows.models import WorkFlow
from api.documents.models import TaxDocument


class TaxDocumentsApprovalService:
    def __init__(self, workflow: WorkFlow):
        self.workflow = workflow
        self.tax_record = self.get_tax_record()

    def get_tax_record(self):
        if hasattr(self.workflow.parent, 'application'):
            return self.workflow.parent.application.tax_record
        else:
            return None

    def process(self):
        if not self.tax_record:
            return

        TaxDocument.objects.filter(tax_record=self.tax_record, completed=True).update(approved=True)
