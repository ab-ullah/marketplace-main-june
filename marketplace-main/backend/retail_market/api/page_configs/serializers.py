from rest_framework import serializers

from api.page_configs.models import PageConfig, CustomTextConfig


class PageConfigSerializer(serializers.ModelSerializer):

    class Meta:
        model = PageConfig
        fields = ('page_value',)


class CustomTextConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomTextConfig
        fields = '__all__'
