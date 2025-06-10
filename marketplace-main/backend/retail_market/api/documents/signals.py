from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver

from api.comments.models import ApplicationComment
from api.constants.kyc_investor_types import KYCInvestorType
from api.documents.models import Document, KYCDocument


@receiver(pre_delete, sender=Document)
def mark_comments_for_deleted_document(sender, instance: Document, using, **kwargs):
    ApplicationComment.objects.filter(
        document_identifier=instance.document_id,
        status=ApplicationComment.Statuses.CREATED
    ).update(status=ApplicationComment.Statuses.UPDATED)


@receiver(post_save, sender=KYCDocument)
def update_document_section_comments(sender, instance: KYCDocument, created, **kwargs):
    if created:
        try:
            question_id = instance.kyc_record_file_id
            kyc_record_id = instance.kyc_record_id
            if instance.kyc_record.kyc_investor_type == KYCInvestorType.PARTICIPANT.value:
                question_id = f'participant_{instance.kyc_record_id}_{question_id}'
                kyc_record_id = instance.kyc_record.kyc_entity_id
            ApplicationComment.objects.filter(
                kyc_record_id=kyc_record_id,
                question_identifier=question_id,
                status=ApplicationComment.Statuses.CREATED
            ).update(status=ApplicationComment.Statuses.UPDATED)
        except Exception:
            pass
