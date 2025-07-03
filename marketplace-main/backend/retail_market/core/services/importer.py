from django.apps import apps
from django.db import transaction
from django.db.models.fields.related import ForeignKey, OneToOneField

from api.companies.models import Company


class ImportService:
    def __init__(self, env='staging'):
        self.env = env
        self.imported = {}  # Keep track of imported objects to avoid duplicates
        self.model_names = [
            'MultiTenantModel', 'AdminUser', 'Deal', 'EmploymentRecord', 'Position',
            'TransactionalConsideration', 'ValuationConsideration', 'ParticipantProfile'
        ]

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
                    raise Exception(f"Failed to import {model_label} (env_id={env_id}): {str(e)}")
        return imported_objects

    def import_instance(self, data):
        model_label = data.get('model')
        model_class = apps.get_model(model_label)
        fields = data.get('fields')
        env_id = data.get('env_id')
        relations = data.get('relations', {})
        m2m = data.get('m2m', {})

        key = f"{model_label}:{env_id}"
        if key in self.imported:
            return self.imported[key]
        
        resolved_fields = self.resolve_fields(model_class, fields, relations)
        # Remove 'id' if present in resolved fields to avoid conflicts and new object creation
        resolved_fields['staging_id'] = resolved_fields.pop('id')
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
                            company_staging_id = fields.get('company')
                            if fk_model.__name__ != 'Company' and company_staging_id and fk_model.__name__ in self.model_names:
                                company_id = Company.objects.get(staging_id = company_staging_id).id
                                resolved[field_name] = fk_model.objects.get(staging_id=raw_id, company_id=company_id)
                            else:
                                resolved[field_name] = fk_model.objects.get(staging_id=raw_id)
                        except fk_model.DoesNotExist:
                            raise ValueError(f"Related instance {fk_model.__name__} with staging_id={raw_id} does not exist and was not imported yet")
            else:
                if field_name in fields:
                    resolved[field_name] = fields[field_name]

        return resolved


class CompanyImportService:
    def __init__(self, company_id, env):
        self.env = env
        self.company_id = company_id
        self.imported = {}  # Keep track of imported objects to avoid duplicates
        self.model_names = [
            'MultiTenantModel', 'AdminUser', 'Deal', 'EmploymentRecord', 'Position',
            'TransactionalConsideration', 'ValuationConsideration', 'ParticipantProfile'
        ]

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
                    raise Exception(f"Failed to import {model_label} (env_id={env_id}): {str(e)}")
        return imported_objects

    def import_instance(self, data):
        model_label = data.get('model')
        if model_label == 'companies.Company':
            return Company.objects.get(id=self.company_id)

        model_class = apps.get_model(model_label)
        fields = data.get('fields')
        env_id = data.get('env_id')
        relations = data.get('relations', {})
        m2m = data.get('m2m', {})

        key = f"{model_label}:{env_id}"
        if key in self.imported:
            return self.imported[key]
        # If company is a field and company_id is provided, override it
        if self.company_id and 'company' in fields:
            fields['company'] = self.company_id

        resolved_fields = self.resolve_fields(model_class, fields, relations)
        # Remove 'id' if present in resolved fields to avoid conflicts and new object creation
        resolved_fields['staging_id'] = resolved_fields.pop('id')
        filter_field = {
            'production': 'staging_id',
            'staging': 'production_id'
        }.get(self.env)

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
                            if self.company_id and fk_model.__name__ in self.model_names:
                                resolved[field_name] = fk_model.objects.get(staging_id=raw_id, company_id=self.company_id)
                            elif fk_model.__name__ == 'Company':
                                resolved[field_name] = fk_model.objects.get(id=self.company_id)
                            else:
                                resolved[field_name] = fk_model.objects.get(staging_id=raw_id)
                        except fk_model.DoesNotExist:
                            raise ValueError(f"Related instance {fk_model.__name__} with staging_id={raw_id} does not exist and was not imported yet")
            else:
                if field_name in fields:
                    resolved[field_name] = fields[field_name]

        return resolved
