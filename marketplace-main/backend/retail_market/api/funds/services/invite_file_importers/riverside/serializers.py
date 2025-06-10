from rest_framework import serializers


class RiverSideInviteFileRowSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    last_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    vehicle = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    investing_entity = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    max_leverage_percentage = serializers.FloatField(required=False, allow_null=True)
