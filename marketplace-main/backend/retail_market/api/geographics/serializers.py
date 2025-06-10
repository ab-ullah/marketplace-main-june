from rest_framework import serializers

from api.constants.id_documents import IdDocuments
from api.geographics.models import Country, Region, CountryIdDocumentType


class CountrySelectorSerializer(serializers.ModelSerializer):
    value = serializers.CharField(source='iso_code')
    label = serializers.CharField(source='name')

    class Meta:
        model = Country
        fields = ('label', 'value', 'id')


class RegionSelectorSerializer(serializers.ModelSerializer):
    value = serializers.CharField(source='region_code')
    label = serializers.CharField(source='name')
    countries = serializers.SerializerMethodField()

    class Meta:
        model = Region
        fields = ('label', 'value', 'countries', 'id')

    @staticmethod
    def get_countries(obj: Region):
        return list(
            obj.countries.values_list('name', flat=True)
        )


class CountryIdDocumentSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()

    class Meta:
        model = CountryIdDocumentType
        fields = ('id', 'name', 'label')

    @staticmethod
    def get_id(obj: CountryIdDocumentType):
        return IdDocuments(obj.id_document_type).value

    @staticmethod
    def get_name(obj: CountryIdDocumentType):
        return IdDocuments(obj.id_document_type).name

    @staticmethod
    def get_label(obj: CountryIdDocumentType):
        return obj.get_id_document_type_display()


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ('id', 'name', 'iso_code')