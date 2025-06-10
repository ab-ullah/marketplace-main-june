
from django.db import transaction

from api.agreements.services.singed_response import SignedResponseService
from api.carry_pools.models import ParticipantCarryDocument
from api.companies.models import Company
from api.companies.models import CompanyUser


class CarrySignedResponseService(SignedResponseService):
    def __init__(self, envelope_id: str, instance: ParticipantCarryDocument, company: Company, document_title: str):
        super().__init__(envelope_id, company, document_title)
        self.instance = instance
        self.company_user = CompanyUser.objects.get(
            company=self.instance.company,
            user=self.instance.user
        )

    def process(self):
        with transaction.atomic():
            signed_document, certificate = super().process()
            self.instance.signed_document = signed_document
            self.instance.certificate = certificate
            self.instance.save()
