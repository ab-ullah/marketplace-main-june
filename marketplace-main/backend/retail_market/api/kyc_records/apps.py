from django.apps import AppConfig


class KYCRecordsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.kyc_records'

    def ready(self):
        import api.kyc_records.signals