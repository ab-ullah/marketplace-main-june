from django.utils import timezone
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.libs.auth0.management_api import Auth0ManagementAPI
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.users.models import RetailUser
from api.users.serializers import RetailUserInfoSerializer, UserNotificationCountSerializer
from api.users.services.create_user import CreateUserService


class CreateUserListCreateAPIView(APIView):
    def get(self, request, *args, **kwargs):
        auth0 = Auth0ManagementAPI()
        users = auth0.get_users()
        return Response(users)

    def post(self, request, *args, **kwargs):
        payload = request.data
        user_service = CreateUserService(payload=payload)
        created_user = user_service.create()
        return Response(created_user)


class UserInfoAPIView(RetrieveAPIView):
    serializer_class = RetailUserInfoSerializer

    def get_object(self):
        return self.request.user


class RegisterFirstLogin(APIView):
    serializer_class = RetailUserInfoSerializer

    def get(self, request):
        user = request.user  # type: RetailUser
        if not user.first_login_at:
            user.first_login_at = timezone.now()
            user.save(update_fields=['first_login_at'])
        return Response({'status': 'success'})


class UserUnreadNotificationCountAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = UserNotificationCountSerializer

    def get_object(self):
        return self.request.user
