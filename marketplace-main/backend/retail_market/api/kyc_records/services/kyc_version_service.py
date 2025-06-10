from django.core.exceptions import ObjectDoesNotExist

from api.applications.models import Application
from api.documents.models import KYCDocument
from api.kyc_records.models import KYCRecord


class KYCVersionHistory:
    def __init__(self, application: Application, kyc_record: KYCRecord):
        self.application = application
        self.kyc_record = kyc_record
        self.gp_signing_completed_at = application.gp_signing_completed_at

    def get_record(self):
        if not self.gp_signing_completed_at:
            return self.kyc_record

        return self.get_instance_as_of(self.kyc_record)

    def get_queryset(self, filters):
        if not self.gp_signing_completed_at:
            return KYCRecord.objects.filter(**filters)

        return [self.get_record()]

    def get_documents(self):
        if not self.gp_signing_completed_at:
            return self.kyc_record.kyc_documents.filter(
                kyc_record_id=self.kyc_record.id,
                deleted=False,
            ).select_related('document')

        kyc_documents = KYCDocument.include_deleted.filter(
            created_at__lt=self.gp_signing_completed_at,
            kyc_record=self.kyc_record,
        ).select_related('document')
        historic_kyc_documents = []
        for kyc_document in kyc_documents:
            historic_kyc_document = self.get_instance_as_of(kyc_document)
            if not historic_kyc_document.deleted:
                historic_kyc_documents.append(historic_kyc_document)

        return historic_kyc_documents

    def get_instance_as_of(self, instance):
        try:
            return instance.history.as_of(self.gp_signing_completed_at)
        except ObjectDoesNotExist:
            pass

        try:
            return instance.history.latest().instance
        except ObjectDoesNotExist:
            return instance

    def get_participants(self):
        if not self.gp_signing_completed_at:
            return self.kyc_record.kyc_participants.all()

        participants = KYCRecord.include_deleted.filter(
            created_at__lt=self.gp_signing_completed_at,
            kyc_entity=self.kyc_record,
        )
        historic_participants = []
        for participant in participants:
            historic_participant = self.get_instance_as_of(participant)
            if not historic_participant.deleted:
                historic_participants.append(historic_participant)

        return historic_participants
