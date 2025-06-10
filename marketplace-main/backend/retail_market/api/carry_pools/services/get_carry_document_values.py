from api.agreements.services.application_data.carry_allocation_data import ParticipantCarryDocumentOptions
from api.agreements.services.application_data.carry_document_details import CarryDocumentsOptions
from api.agreements.services.application_data.get_application_values import GetApplicationValuesService
from api.carry_pools.models import ParticipantCarryDocument


class GetCarryValuesService(GetApplicationValuesService):
    def __init__(self, participant_carry_document: ParticipantCarryDocument):
        self.participant_carry_document = participant_carry_document

    def get(self):
        participant_values = ParticipantCarryDocumentOptions().get_values(instance=self.participant_carry_document)
        carry_document_options = CarryDocumentsOptions().get_values(
            instance=self.participant_carry_document.carry_document
        )
        preprocess = {
            'participant_details': participant_values,
            'carry_document_details': carry_document_options,
        }
        return preprocess

    def get_filtered_values_as_dict(self):
        return {k: v['value'] for k, v in self.get_as_dict().items() if 'value' in v}
