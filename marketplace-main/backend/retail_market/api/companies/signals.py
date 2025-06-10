from django.conf import settings
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.template.defaultfilters import slugify

from api.companies.models import Company
from core.services.setup_db import SetupDbService


@receiver(pre_save, sender=Company)
def add_company_slug(sender, instance, *args, **kwargs):
    if not instance.slug:
        instance.slug = slugify(instance.name)


if not settings.IS_TEST_RUN:
    @receiver(post_save, sender=Company)
    def update_investment_from_loan_activity(sender, instance: Company, created, **kwargs):
        if created:
            SetupDbService(
                company_name=instance.name,
                admin_emails=[],
                financial_reviewer_emails=[],
                knowledgeable_reviewer_emails=[]
            ).process()
