from api.comments.models import ApplicationComment


class UpdateCommentService:
    def __init__(self, instance, update_values, module):
        self.instance = instance
        self.updated_values = update_values
        self.module = module
        self.updated_fields = self.get_updated_fields()

    def get_updated_fields(self):
        updated_field_names = []
        for field_name, value in self.updated_values.items():
            current_value = getattr(self.instance, field_name)
            if current_value == value:
                continue
            updated_field_names.append(field_name)
        return updated_field_names

    def update_comments_status(self, prefix=None):
        if prefix:
            updated_fields = []
            for field in self.updated_fields:
                updated_fields.append(f'{prefix}_{field}')
        else:
            updated_fields = self.updated_fields
        ApplicationComment.objects.filter(
            module=self.module,
            module_id=self.instance.id,
            status=ApplicationComment.Statuses.CREATED,
            question_identifier__in=updated_fields
        ).update(status=ApplicationComment.Statuses.UPDATED)

    def update_question_comments(self, question_identifier):
        ApplicationComment.objects.filter(
            module=self.module,
            module_id=self.instance.id,
            status=ApplicationComment.Statuses.CREATED,
            question_identifier=question_identifier
        ).update(status=ApplicationComment.Statuses.UPDATED)

    def update_application_module(self, application_id):
        ApplicationComment.objects.filter(
            module=self.module,
            status=ApplicationComment.Statuses.CREATED,
            application_id=application_id
        ).update(status=ApplicationComment.Statuses.UPDATED)
