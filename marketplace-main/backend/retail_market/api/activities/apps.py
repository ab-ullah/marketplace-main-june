from django.apps import AppConfig


class ActivitiesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.activities'

    def ready(self):
        import api.activities.signals
