from django.contrib.auth.models import Group
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.admin_users.models import AdminUser
from api.users.constants import ADMIN_GROUP_NAME
from api.users.serializers import GroupSerializer, RetailUserSerializer
from api.companies.admin_views.serializers import CompanySerializer


class AdminUserSerializer(serializers.ModelSerializer):
    user = RetailUserSerializer()
    groups = GroupSerializer(many=True)
    company = CompanySerializer()
    has_full_access = serializers.SerializerMethodField()
    use_riverside_template = serializers.SerializerMethodField()

    class Meta:
        model = AdminUser
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_has_full_access(obj: AdminUser):
        return obj.groups.filter(name=ADMIN_GROUP_NAME).exists()

    @staticmethod
    def get_use_riverside_template(obj: AdminUser):
        company = obj.company
        if hasattr(company, 'importer'):
            return company.importer.importer_name == 'RiverSideImporter'


class GroupWithAdminUsersSerializer(serializers.ModelSerializer):
    admins = serializers.SerializerMethodField(read_only=True)
    admin_ids = serializers.JSONField(write_only=True)

    class Meta:
        model = Group
        fields = ('id', 'name', 'admins', 'admin_ids')

    def update(self, instance, validated_data):
        admin_ids = validated_data.pop('admin_ids', [])
        for admin_id in admin_ids:
            admin_user = AdminUser.objects.filter(company=self.context['company'], id=admin_id).first()
            if admin_user:
                admin_user.groups.add(instance)
                admin_user.save()
            else:
                raise ValidationError({'admin_ids': f'Invalid admin id [{admin_id}].'})

        return instance

    def get_admins(self, instance):
        admin_users = instance.group_admin_users.filter(company=self.context['company'])
        return [AdminUserSerializer(user).data for user in admin_users]
