import json
import logging

from django.core.serializers.json import DjangoJSONEncoder
from django.core.validators import get_available_image_extensions
from django.db import models
from encrypted_fields.fields import EncryptedFieldMixin
from simple_history.models import HistoricalRecords

from core.managers.has_company_filter_manager import HasCompanyFilterManager
from core.managers.non_deleted_manager import NonDeletedManager

IMAGE_EXTENTIONS = get_available_image_extensions() + ['svg']


class Seen(Exception):
    pass


logger = logging.getLogger()


class BaseModel(models.Model):
    staging_id = models.IntegerField(null=True, blank=True, unique=True, db_index=True)
    production_id = models.IntegerField(null=True, blank=True, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    objects = NonDeletedManager()
    include_deleted = models.Manager()

    class Meta:
        abstract = True

    def shift_paths(self, exclude, name):
        return tuple(item.split('.', 1)[1] for item in exclude
                     if item.startswith(('{0}.'.format(name), '*.')))

    @staticmethod
    def is_jsonable(x):
        try:
            json.dumps(x, cls=DjangoJSONEncoder)
            return True
        except TypeError:
            return False

    def deep_dump_instance(self,
                           depth,
                           seen):
        """
            Deep-dumps fields of a model instance as a json serializable dict
        """
        if (self.__class__, self.pk) in seen:
            raise Seen()
        seen.add((self.__class__, self.pk))
        field_names = sorted(
            [field.name for field in self._meta.fields] + [field.name for field in self._meta.related_objects])

        dump = dict()
        for name in field_names:
            should_we_add = True
            try:
                value = getattr(self, name)
            except models.ObjectDoesNotExist:
                value = None
            except AttributeError:
                logging.error(f"object {self} of {self.__class__} does not have attribute {name}")
                continue
            if depth >= 1:
                try:
                    related_objects = value.all()
                    value = []
                    for related in related_objects:
                        try:
                            value.append(related.deep_dump_instance(
                                depth=depth - 1,
                                seen=seen))
                        except Seen:
                            pass
                except AttributeError:
                    pass
                try:
                    value = value.deep_dump_instance(
                        depth=depth - 1,
                        seen=seen)
                except Seen:
                    should_we_add = False
                except AttributeError:
                    pass
                if self.is_jsonable(value) and should_we_add:
                    dump[name] = value
                else:
                    logging.info(f"not json serializable: key:{name} value:{value}")
        return dump

    def deep_dump_flattened_instance(self, depth, seen):
        """
            Dumps flattened fields of a model instance as a json serializable dict, doesn't include related objects
        """
        seen.add((self.__class__, self.pk))
        field_names = sorted(
            [field.name for field in self._meta.fields])

        dump = dict()
        for name in field_names:
            try:
                value = getattr(self, name)
            except models.ObjectDoesNotExist:
                value = None
            except AttributeError:
                logging.error(f"object {self} of {self.__class__} does not have attribute {name}")
                continue
            if depth >= 1:
                try:
                    flattened_dump = value.deep_dump_flattened_instance(depth=depth - 1, seen=seen)
                    for k, v in flattened_dump.items():
                        dump[f"{name}_{k}"] = v
                except Seen:
                    continue
                except AttributeError:
                    if self.is_jsonable(value):
                        dump[name] = value
                    else:
                        logging.info(f"not json serializable: key:{name} value:{value}")
        return dump


class MultiTenantModel(BaseModel):
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
    )
    objects = HasCompanyFilterManager()
    history = HistoricalRecords(inherit=True)

    class Meta:
        abstract = True


class EncryptedDecimalField(EncryptedFieldMixin, models.DecimalField):
    pass


class CurrencyConversionModel(BaseModel):
    company_currency_rate = models.FloatField(null=True, blank=True)
    investor_investment_currency_rate = models.FloatField(null=True, blank=True)
    investor_local_currency_rate = models.FloatField(null=True, blank=True)
    usd_currency_rate = models.FloatField(null=True, blank=True)
    fund_investor = models.ForeignKey(
        'investors.FundInvestor',
        on_delete=models.CASCADE,
    )
    due_date = models.DateField(null=True, blank=True)

    history = HistoricalRecords(inherit=True)

    class Meta:
        abstract = True

    def has_all_conversion_rates(self):
        company = self.fund_investor.fund.company
        if company.base_currency and not self.company_currency_rate:
            return False

        if self.fund_investor.currency and not self.investor_investment_currency_rate:
            return False

        investor = self.fund_investor.investor
        investor_currency = investor.get_investor_currency()

        if investor_currency and not self.investor_local_currency_rate:
            return False

        return True

    def get_missing_conversion_rates(self):
        updated_fields = []
        company = self.fund_investor.fund.company

        if company.base_currency and not self.company_currency_rate:
            company_currency_rate = self.get_conversion_rate(company.base_currency)
            if company_currency_rate:
                self.company_currency_rate = company_currency_rate
                updated_fields.append('company_currency_rate')

        if self.fund_investor.currency and not self.investor_investment_currency_rate:
            investment_currency_rate = self.get_conversion_rate(self.fund_investor.currency)
            if investment_currency_rate:
                self.investor_investment_currency_rate = investment_currency_rate
                updated_fields.append('investor_investment_currency_rate')

        investor = self.fund_investor.investor
        investor_currency = investor.get_investor_currency()

        if investor_currency and not self.investor_local_currency_rate:
            local_currency_rate = self.get_conversion_rate(investor_currency)
            if local_currency_rate:
                self.investor_local_currency_rate = local_currency_rate
                updated_fields.append('investor_local_currency_rate')

        if updated_fields:
            self.save(update_fields=updated_fields)

        return updated_fields

    def get_date(self):
        return self.due_date

    def get_conversion_rate(self, target_currency):
        from api.currencies.services.currency_rate import CurrencyRateService
        if not self.fund_investor.fund.company.allow_multiple_currencies_in_portfolio():
            return None

        conversion_date = self.get_date()
        if not conversion_date:
            return None

        conversion_service = CurrencyRateService(
            from_currency=self.fund_investor.fund.fund_currency,
            to_currency=target_currency,
            date=conversion_date
        )
        conversion_rate = conversion_service.get_conversion_rate()
        if conversion_rate:
            return conversion_rate
        return None


    @staticmethod
    def format_currency(currency, rate):
        if not currency:
            return None

        return {
            'currency': currency.code,
            'symbol': currency.symbol,
            'conversion_rate': rate,
        }

    def get_currency_details(self):
        self.get_missing_conversion_rates()
        fund_investor = self.fund_investor
        company = fund_investor.fund.company

        investor_currency = fund_investor.investor.get_investor_currency()

        payload = {}
        if company.base_currency:
            payload['company_currency'] = self.format_currency(company.base_currency, self.company_currency_rate)


        if self.fund_investor.currency:
            payload['investor_investment_currency'] = self.format_currency(
                self.fund_investor.currency, self.investor_investment_currency_rate
            )

        if investor_currency:
            payload['investor_currency'] = self.format_currency(
                investor_currency, self.investor_local_currency_rate
            )

        return payload
