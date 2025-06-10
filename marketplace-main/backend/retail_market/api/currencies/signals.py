from django.db.models.signals import post_save
from django.dispatch import receiver

from api.currencies.models import CurrencyRate, Currency
from api.currencies.services.company_currency_details import CompanyCurrencyService


@receiver(post_save, sender=CurrencyRate)
def update_company_currency_rate_info(sender, instance: CurrencyRate, created, **kwargs):
    company = instance.from_currency.company
    currency_service = CompanyCurrencyService(company=company)
    currency_service.update_cache()


@receiver(post_save, sender=Currency)
def update_company_currency_info(sender, instance: Currency, created, **kwargs):
    company = instance.company
    currency_service = CompanyCurrencyService(company=company)
    currency_service.update_cache()
