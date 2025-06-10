from django.db import models

class ApplicantCompanyDocumentManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(
            deleted=False,
            company_document__document__deleted=False
        ).exclude(
            signed_document__deleted=True
        )

class ActiveApplications(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted=False, user__deleted=False)
