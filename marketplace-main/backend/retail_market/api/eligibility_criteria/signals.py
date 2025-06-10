from django.db.models.signals import post_save
from django.dispatch import receiver

from api.comments.models import ApplicationComment
from api.eligibility_criteria.blocks_data.block_ids import HONG_KONG_BLOCK_ID
from api.eligibility_criteria.models import CriteriaBlock, ResponseBlockDocument


@receiver(post_save, sender=CriteriaBlock)
def post_process_criteria_block_update(sender, instance: CriteriaBlock, created, **kwargs):
    if instance.block and instance.block.block_id == HONG_KONG_BLOCK_ID:
        admin_options = instance.block.options['admin_options']
        auto_completed = all([instance.payload.get(option['id']) for option in admin_options])
        if instance.auto_completed != auto_completed:
            instance.auto_completed = auto_completed
            instance.save(update_fields=['auto_completed'])


@receiver(post_save, sender=ResponseBlockDocument)
def update_eligibility_document_section_comments(sender, instance: ResponseBlockDocument, created, **kwargs):
    if created:
        try:
            application = instance.response_block.criteria_response.applications.first()
            block_id = instance.response_block.block.block_id
            ApplicationComment.objects.filter(
                application_id=application.id,
                module=ApplicationComment.ModuleChoices.ELIGIBILITY_CRITERIA,
                question_identifier=f'{instance.response_block_id}-view-only',
                status=ApplicationComment.Statuses.CREATED
            ).update(status=ApplicationComment.Statuses.UPDATED)
        except Exception:
            pass
