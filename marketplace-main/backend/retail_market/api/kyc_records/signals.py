from django.db.models.signals import post_save
from django.dispatch import receiver

from api.kyc_records.models import KYCRecord
from api.users.models import RetailUser


@receiver(post_save, sender=KYCRecord)
def populate_retail_user_name(sender, instance: KYCRecord, created, **kwargs):
    if created and instance.first_name and instance.last_name:
        RetailUser.objects.filter(
            id=instance.user_id
        ).update(
            first_name=instance.first_name,
            last_name=instance.last_name
        )

