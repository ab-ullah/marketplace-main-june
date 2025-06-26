import json
from django.apps import apps
from django.forms.models import model_to_dict


class ExporterService:
    """A service to export Django model instances with their relations and many-to-many fields."""
    def __init__(self, depth):
        self.max_depth = depth


    def deep_serialize_instance(self, instance, depth, env='staging', exported=None):
        if depth > self.max_depth:
            return None

        if exported is None:
            exported = {}

        key = f"{instance._meta.label}:{getattr(instance, 'id')}"
        if key in exported:
            return

        data = {
            'model': instance._meta.label,
            'env_id': getattr(instance, f'{env}_id', getattr(instance, 'id')),
            'fields': {},
            'relations': {},
            'm2m': {}
        }

        exported[key] = data  # Prevent recursion
        depth += 1

        for field in instance._meta.get_fields():
            # Handle M2M
            if field.is_relation and field.many_to_many:
                if field.auto_created:
                    related_objects = getattr(instance, field.get_accessor_name()).all()
                else:
                    related_objects = getattr(instance, field.name).all()
                serialized = [
                    self.deep_serialize_instance(obj, depth, env, exported)
                    for obj in related_objects
                ]
                serialized = [obj for obj in serialized if isinstance(obj, dict)]
                if serialized:
                    data['m2m'][field.name] = serialized

            # Handle FK and OneToOne
            elif field.is_relation and not field.auto_created:
                related_obj = getattr(instance, field.name, None)
                if related_obj:
                    # Put just the ID in fields
                    data['fields'][field.name] = getattr(related_obj, 'id', None)
                    # Optionally serialize full relation if in depth
                    serialized = self.deep_serialize_instance(related_obj, depth, env, exported)
                    if isinstance(serialized, dict):
                        data['relations'][field.name] = serialized
                else:
                    data['fields'][field.name] = None

            # Handle all other fields (non-relational)
            elif not field.is_relation:
                try:
                    value = getattr(instance, field.name)
                    data['fields'][field.name] = value
                except Exception:
                    pass  # Optionally log or skip silently

        # Prune empty structures
        if not data['relations']:
            del data['relations']
        if not data['m2m']:
            del data['m2m']

        return data

    def export_queryset(self, queryset, env='staging'):
        exported = dict()
        response = list()
        depth = 1
        for obj in queryset:
            serialized_data = self.deep_serialize_instance(obj,depth, env, exported)
            response.append(serialized_data)
        return response


    def save_export_to_file(self, data, file_path):
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=4, default=str)
