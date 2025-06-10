from django.db import models

from api.models import BaseModel
from api.constants.id_documents import IdDocuments


class Country(BaseModel):
    name = models.CharField(max_length=120, unique=True)
    iso_code = models.CharField(max_length=3, unique=True)


class Region(BaseModel):
    name = models.CharField(max_length=120)
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='country_regions')
    region_code = models.CharField(max_length=3)
    countries = models.ManyToManyField(
        'Country',
        related_name='associated_regions'
    )

    class Meta:
        unique_together = ('company', 'region_code')


class CountryIdDocumentType(BaseModel):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name="countries", null = False)
    id_document_type = models.PositiveSmallIntegerField(choices=IdDocuments.choices, null =  False)


class USState(BaseModel):
    name = models.CharField(max_length=120, unique=True)
    iso_code = models.CharField(max_length=3, unique=True)


class Address(BaseModel):
    street1 = models.CharField(max_length=100)
    street2 = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=50, null=True, blank=True)
    state = models.ForeignKey(
        USState,
        on_delete=models.CASCADE,
        related_name='address_states'
    )
    country = models.ForeignKey(
        Country,
        on_delete=models.CASCADE,
        related_name='address_countries'
    )
    zip_code = models.CharField(max_length=50, null=True, blank=True)
