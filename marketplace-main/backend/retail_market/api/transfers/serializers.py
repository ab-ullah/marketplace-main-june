from rest_framework import serializers

from api.applications.serializers import ApplicationSerializer
from api.transfers.models import Transfer


class TransferSerializer(serializers.ModelSerializer):
    transfer_application = ApplicationSerializer()

    class Meta:
        model = Transfer
        exclude = ('created_at', 'modified_at')
