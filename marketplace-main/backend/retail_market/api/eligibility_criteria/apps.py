from django.apps import AppConfig


class EligibilityCriteriaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.eligibility_criteria'

    def ready(self):
        import api.eligibility_criteria.signals
