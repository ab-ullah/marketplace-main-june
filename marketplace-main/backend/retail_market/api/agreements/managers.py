from django.db import models


class ApplicantAgreementDocumentManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(
            deleted=False,
            agreement_document__document__deleted=False
        ).exclude(
            signed_document__deleted=True
        )
