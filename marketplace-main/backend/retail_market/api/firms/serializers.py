from rest_framework import serializers

from api.firms.models import Firm


class FirmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firm
        exclude = ('created_at', 'modified_at')
