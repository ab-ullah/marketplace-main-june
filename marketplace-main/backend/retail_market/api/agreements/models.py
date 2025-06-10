import uuid

from django.db import models
from django.db.models import UniqueConstraint, Q
from simple_history.models import HistoricalRecords

from api.agreements.constants.related_names import (
    COMPANY_AGREEMENT_DOCUMENTS, FUND_AGREEMENT_DOCUMENTS,
    DOCUMENT_AGREEMENT, APPLICATION_AGREEMENTS, ACTUAL_AGREEMENT_DOCUMENT,
    SIGNED_AGREEMENT_DOCUMENT, APPLICATION_WITNESS, WITNESS_AGREEMENTS, AGREEMENT_WITNESS, WITNESS_DOCUMENT,
    SIGNED_WITNESS_DOCUMENT, FUND_DOCUMENT_APPLICANTS
)
from api.agreements.managers import ApplicantAgreementDocumentManager
from api.models import BaseModel


class FundAgreementDocument(BaseModel):
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name=COMPANY_AGREEMENT_DOCUMENTS
    )
    fund = models.ForeignKey(
        'funds.Fund',
        on_delete=models.CASCADE,
        related_name=FUND_AGREEMENT_DOCUMENTS
    )
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name=DOCUMENT_AGREEMENT
    )

    class Meta:
        unique_together = (
            'company',
            'fund',
            'document'
        )

    def get_fund_name(self):
        return self.fund.name

    def get_full_name(self):
        if self.document.uploaded_by_user:
            return self.document.uploaded_by_user.user.get_full_name()
        return ""


class ApplicantAgreementDocument(BaseModel):
    history = HistoricalRecords()

    agreement_document = models.ForeignKey(
        'documents.FundDocument',
        on_delete=models.CASCADE,
        related_name=FUND_DOCUMENT_APPLICANTS,
        null=True,
        blank=True
    )
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name=APPLICATION_AGREEMENTS
    )
    completed = models.BooleanField(default=False)
    envelope_id = models.CharField(max_length=80, unique=True, null=True)
    signed_document = models.OneToOneField(
        'documents.Document',
        on_delete=models.SET_NULL,
        related_name=ACTUAL_AGREEMENT_DOCUMENT,
        null=True,
        blank=True
    )
    certificate = models.OneToOneField(
        'documents.Document',
        on_delete=models.SET_NULL,
        related_name=SIGNED_AGREEMENT_DOCUMENT,
        null=True,
        blank=True
    )
    gp_signing_complete = models.BooleanField(default=False)
    objects = ApplicantAgreementDocumentManager()
    deleted = models.BooleanField(default=False)

    task = models.OneToOneField(
        'workflows.Task',
        related_name='agreement_document',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['agreement_document', 'application'],
                condition=Q(deleted=False),
                name='unique_agreement_document_application_validation'
            )
        ]

    def is_fully_completed(self):
        if self.agreement_document.require_gp_signature:
            return self.gp_signing_complete

        return self.completed

    def get_full_name(self):
        return f"{self.application.applicant_first_name()} {self.application.applicant_last_name()}"

    def get_fund_name(self):
        return self.application.fund.name


class ApplicationWitness(BaseModel):
    email = models.EmailField()
    name = models.CharField(max_length=120)
    application = models.OneToOneField(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name=APPLICATION_WITNESS
    )

    class Meta:
        unique_together = (
            'email',
            'application'
        )


class AgreementDocumentWitness(BaseModel):
    witness = models.ForeignKey(
        'ApplicationWitness',
        on_delete=models.CASCADE,
        related_name=WITNESS_AGREEMENTS
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    applicant_agreement_document = models.OneToOneField(
        'ApplicantAgreementDocument',
        on_delete=models.CASCADE,
        related_name=AGREEMENT_WITNESS
    )
    completed = models.BooleanField(default=False)
    envelope_id = models.CharField(max_length=80, unique=True)
    signed_document = models.OneToOneField(
        'documents.Document',
        on_delete=models.SET_NULL,
        related_name=WITNESS_DOCUMENT,
        null=True,
        blank=True
    )
    certificate = models.OneToOneField(
        'documents.Document',
        on_delete=models.SET_NULL,
        related_name=SIGNED_WITNESS_DOCUMENT,
        null=True,
        blank=True
    )
    email_sent = models.BooleanField(default=False)

    def get_witness_details(self):
        witness = self.witness
        return {
            "signer_email": witness.email,
            "signer_name": witness.name,
            "signer_client_id": witness.id,
        }

    class Meta:
        unique_together = (
            'witness',
            'applicant_agreement_document'
        )

    def get_full_name(self):
        return self.applicant_agreement_document.get_full_name()

    def get_fund_name(self):
        return self.applicant_agreement_document.application.fund.name
