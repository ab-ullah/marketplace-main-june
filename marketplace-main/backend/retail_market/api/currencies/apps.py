from django.apps import AppConfig


class CurrenciesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.currencies'

    def ready(self):
        import api.currencies.signals
