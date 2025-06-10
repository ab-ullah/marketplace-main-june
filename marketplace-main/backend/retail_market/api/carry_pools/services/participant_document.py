from api.carry_pools.models import ParticipantCarryDocument
from api.carry_pools.services.carry_notification import CarryEmailService


class AdminParticipantDocumentService:
    def __init__(self, company):
        self.company = company

    def release_documents_in_carry_plan(self, carry_plan):
        participant_carry_docs = ParticipantCarryDocument.objects.filter(
            carry_plan=carry_plan,
            company=self.company,
            is_released=False,
        )

        for participant_document in participant_carry_docs:
            participant_document.is_released = True
            participant_document.save()
            CarryEmailService(
                participant_document.carry_document.name,
                participant_document.user.id,
                carry_plan.name,
                self.company
            ).send_email()

    def release_document_for_participant(self, participant_carry_document):
            CarryEmailService(
                participant_carry_document.carry_document.name,
                participant_carry_document.user.id,
                participant_carry_document.carry_plan.name,
                self.company
            ).send_email()
