import logging
from django.apps import apps
from django.db import transaction
from django.db.models.fields.related import ForeignKey, OneToOneField

logger = logging.getLogger(__name__)


class ImportService:
    def __init__(self, env='staging'):
        self.env = env
        self.imported = {}  # Keep track of imported objects to avoid duplicates
        self.errors = []

    def import_data(self, data_list):
        imported_objects = []
        with transaction.atomic():
            for data in data_list:
                try:
                    obj = self.import_instance(data)
                    imported_objects.append(obj)
                except Exception as e:
                    model_label = data.get('model', 'Unknown')
                    env_id = data.get('env_id', 'Unknown')
                    self.errors.append(f"Failed to import {model_label} (env_id={env_id}): {str(e)}")
                    logger.exception(f"Failed to import {model_label} (env_id={env_id})")
        return imported_objects


    def import_instance(self, data):
        model_label = data['model']
        model_class = apps.get_model(model_label)
        fields = data['fields']
        env_id = data['env_id']
        relations = data.get('relations', {})
        m2m = data.get('m2m', {})

        key = f"{model_label}:{env_id}"
        if key in self.imported:
            return self.imported[key]
        
        resolved_fields = self.resolve_fields(model_class, fields, relations)
        # Remove 'id' if present in resolved fields to avoid conflicts and new object creation
        resolved_fields.pop('id', None)
        env_to_filter = {
            'production': 'staging_id',  # Note: Your original had production using staging_id
            'staging': 'production_id'   # and staging using production_id - keeping this logic
        }

        filter_field = env_to_filter.get(self.env)
        obj, _ = model_class.objects.update_or_create(
            **{filter_field: env_id},
            defaults=resolved_fields
        )

        self.imported[f"{model_label}:{env_id}"] = obj

        # Handle M2M
        for field_name, related_items in m2m.items():
            m2m_field = getattr(obj, field_name)
            ids = []
            for related_data in related_items:
                related_obj = self.import_instance(related_data)
                ids.append(related_obj.id)
            m2m_field.set(ids)

        return obj

    def resolve_fields(self, model_class, fields, relations):
        resolved = {}

        for field in model_class._meta.get_fields():
            if field.many_to_many:
                continue

            field_name = field.name

            if isinstance(field, (ForeignKey, OneToOneField)):
                if field_name in relations:
                    related_data = relations[field_name]
                    related_obj = self.import_instance(related_data)
                    resolved[field_name] = related_obj
                elif field_name in fields and fields[field_name]:
                    fk_model = field.related_model
                    raw_id = fields[field_name]
                    # Try to use imported cache first
                    cache_key = f"{fk_model._meta.label}:{raw_id}"
                    if cache_key in self.imported:
                        resolved[field_name] = self.imported[cache_key]
                    else:
                        try:
                            resolved[field_name] = fk_model.objects.get(staging_id=raw_id)
                        except fk_model.DoesNotExist:
                            raise ValueError(f"Related instance {fk_model.__name__} with staging_id={raw_id} does not exist and was not imported yet")
            else:
                if field_name in fields:
                    resolved[field_name] = fields[field_name]

        return resolved
