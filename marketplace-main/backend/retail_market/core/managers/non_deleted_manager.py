from django.db import models


class NonDeletedManager(models.Manager):
    def has_deleted_relation_field(self, field_name, model_name):
        model = self.model
        if hasattr(model, field_name):
            related_field = model._meta.get_field(field_name)
            if related_field and hasattr(related_field, 'related_model'):
                related_model = related_field.related_model
                if related_model and getattr(related_model, '__name__') == model_name:
                    return hasattr(related_model, 'deleted')
        return False

    def get_queryset(self):
        model = self.model
        queryset = super().get_queryset()
        if hasattr(model, 'deleted'):
            queryset = queryset.filter(deleted=False)

        if self.has_deleted_relation_field('user', 'RetailUser'):
            queryset = queryset.exclude(user__deleted=True)

        if self.has_deleted_relation_field('document', 'Document'):
            queryset = queryset.exclude(document__deleted=True)

        return queryset
