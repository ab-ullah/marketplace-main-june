import json
from django.apps import apps
from django.forms.models import model_to_dict


class ExporterService:
    """A service to export Django model instances with their relations and many-to-many fields."""
    def __init__(self, depth):
        self.max_depth = depth


    def deep_serialize_instance(self, instance, depth, env='staging', exported=None):
        if depth > self.max_depth:
            return 
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

        exported[key] = data  # Mark as exported to prevent infinite recursion
        depth +=1
        for field in instance._meta.get_fields():
            if field.is_relation and field.many_to_many:
                if field.auto_created:  # This is a reverse relation
                    related_objects = getattr(instance, field.get_accessor_name()).all()
                else:
                    related_objects = getattr(instance, field.name).all()
                data['m2m'][field.name] = [
                    self.deep_serialize_instance(obj, depth, env, exported)
                    for obj in related_objects if self.deep_serialize_instance(obj, depth, env, exported)
                ]
            elif field.is_relation and not field.auto_created:
                related_obj = getattr(instance, field.name, None)
                if related_obj:
                    data['relations'][field.name] = self.deep_serialize_instance(related_obj, depth, env, exported)
                else:
                    data['relations'][field.name] = None
            elif not field.is_relation:
                data['fields'][field.name] = getattr(instance, field.name)

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
