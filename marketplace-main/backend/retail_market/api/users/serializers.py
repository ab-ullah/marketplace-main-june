import uuid

from django.contrib.auth.models import Group
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.companies.models import CompanyUser, Company
from api.investors.models import Investor
from api.libs.user.user_helper import UserHelper
from api.libs.utils.user_name import get_display_name
from api.notifications.models import PublishedFundUserNotification
from api.users.constants import ADMIN_GROUP_NAME
from api.users.models import RetailUser
from api.users.services.create_user import CreateUserService


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name',)


class RetailUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailUser
        exclude = ('created_at', 'modified_at')


class RetailUserListSerializer(serializers.ModelSerializer):
    groups = serializers.SerializerMethodField()
    group_ids = serializers.JSONField(write_only=True)
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = RetailUser
        fields = ('id', 'first_name', 'last_name', 'email', 'full_name', 'groups', 'group_ids', 'display_name')

    def update(self, instance, validated_data):
        group_ids = validated_data.pop('group_ids', [])
        if group_ids and hasattr(instance, 'admin_user'):
            groups = Group.objects.filter(id__in=group_ids)
            admin_user = instance.admin_user
            admin_user.groups.set(groups)
            admin_user.save()

        updated_instance = super().update(instance=instance, validated_data=validated_data)

        return updated_instance

    def get_groups(self, instance):
        groups = []
        if hasattr(instance, 'admin_user'):
            groups = [GroupSerializer(group).data for group in instance.admin_user.groups.all()]

        return groups

    @staticmethod
    def get_display_name(instance):
        return get_display_name(instance)


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        exclude = ('created_at', 'modified_at')


class CompanyUserSerializer(serializers.ModelSerializer):
    company = CompanySerializer()

    class Meta:
        model = CompanyUser
        exclude = ('created_at', 'modified_at')


class RetailUserInfoSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    company_users = serializers.SerializerMethodField()
    has_full_access = serializers.SerializerMethodField()

    class Meta:
        model = RetailUser
        exclude = ('created_at', 'modified_at')

    @staticmethod
    def get_display_name(obj: RetailUser):
        return get_display_name(user=obj)

    @staticmethod
    def get_company_users(obj: RetailUser):
        companyUsers = CompanyUser.objects.filter(user=obj)
        if companyUsers:
            return CompanyUserSerializer(companyUsers, many=True).data
        return []

    @staticmethod
    def get_has_full_access(obj: RetailUser):
        if hasattr(obj, 'admin_user'):
            return obj.admin_user.groups.filter(name=ADMIN_GROUP_NAME).exists()
        return False


class RetailUserBaseSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = RetailUser
        fields = ('email', 'display_name')

    @staticmethod
    def get_display_name(obj: RetailUser):
        return get_display_name(user=obj)


class UserNotificationCountSerializer(serializers.ModelSerializer):
    unread_notification_count = serializers.SerializerMethodField()

    class Meta:
        model = RetailUser
        fields = ('unread_notification_count',)

    @staticmethod
    def get_unread_notification_count(obj: RetailUser):
        company_user_ids = UserHelper.get_company_user_ids(user=obj)
        investor_ids = UserHelper.get_investor_ids(company_user_ids=company_user_ids)
        return PublishedFundUserNotification.objects.filter(is_read=False).filter(
            Q(user_id__in=company_user_ids) |
            Q(investor_id__in=investor_ids)
        ).count()


class UserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    group_ids = serializers.JSONField(write_only=True)

    def create(self, validated_data):
        company = self.context['company']
        user_service = CreateUserService(
            payload={
                'email': validated_data['email'],
                'first_name': validated_data['first_name'],
                'last_name': validated_data['last_name']
            },
            company=company
        )
        created_user = user_service.create_user(is_admin=True)
        if validated_data['first_name']:
            created_user.first_name = validated_data['first_name']

        if validated_data['last_name']:
            created_user.last_name = validated_data['last_name']

        created_user.save()
        admin_user = created_user.admin_user

        group_ids = validated_data.pop('group_ids', [])
        if group_ids:
            groups = Group.objects.filter(id__in=group_ids)
            admin_user.groups.set(groups)
            admin_user.save()

        return validated_data


class UserInviteSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    full_name = serializers.SerializerMethodField()
    investors = serializers.SerializerMethodField()
    invite_status = serializers.CharField(source='get_invite_status_display', read_only=True)
    id = serializers.IntegerField(read_only=True)
    deleted = serializers.BooleanField(required=False)

    def validate(self, attrs):
        email = attrs['email']
        if RetailUser.objects.filter(email__iexact=email).exists():
            raise ValidationError('User with this email already exists')
        return attrs

    @staticmethod
    def get_investors(obj: RetailUser):
        investors = []
        for company_users in obj.associated_company_users.all():
            for company_user_investor in company_users.associated_investor_profiles.all():
                investors.append({'investor_account_code': company_user_investor.investor.investor_account_code})
        return investors

    def create(self, validated_data):
        company = self.context['company']
        user_service = CreateUserService(
            payload={
                'email': validated_data['email'],
                'first_name': validated_data['first_name'],
                'last_name': validated_data['last_name'],
            },
            company=company
        )
        created_user = user_service.invite_user()
        return created_user

    @staticmethod
    def get_full_name(obj: RetailUser):
        return obj.get_full_name()

    class Meta:
        model = RetailUser
        fields = ('email', 'first_name', "last_name", "full_name", "investors", "invite_status", "id", "deleted")
