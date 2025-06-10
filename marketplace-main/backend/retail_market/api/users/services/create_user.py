import uuid

from api.admin_users.models import AdminUser
from api.companies.models import Company, CompanyUser
from api.constants.companies import FIRST_COMPANY_NAME
from api.libs.auth0.management_api import Auth0ManagementAPI
from api.partners.services.auth0_account_service import CreateAuth0Account
from api.users.models import RetailUser


class CreateUserService:
    def __init__(self, payload, company=None):
        self.payload = payload
        self.company = company or self.get_default_company()

    @staticmethod
    def get_default_company():
        company, _ = Company.objects.get_or_create(name=FIRST_COMPANY_NAME)
        return company

    def create_company_user(self, retail_user: RetailUser):
        company_user, _ = CompanyUser.objects.get_or_create(
            user=retail_user,
            company=self.company,
            # TODO: We need a flow to assign partner id to users that are not in db and log in from okta
            defaults={'partner_id': uuid.uuid4().hex}
        )
        return company_user

    def create_retail_user(self, auth0_user):
        username = auth0_user.get('user_id').replace('|', '.')
        retail_user, _ = RetailUser.objects.get_or_create(
            username=username,
            is_active=True,
            defaults={
                'email': self.payload['email'],
                'is_active': True
            }
        )
        self.create_company_user(retail_user=retail_user)
        return retail_user

    def update_create_retail_user(self, auth0_user):
        username = auth0_user.get('user_id').replace('|', '.')
        try:
            retail_user = RetailUser.include_deleted.get(email__iexact=self.payload['email'])
            retail_user.username = username
            retail_user.is_active = True
            retail_user.deleted = False
            retail_user.save()
        except RetailUser.DoesNotExist:
            retail_user = RetailUser.objects.create(
                email=self.payload['email'],
                is_active=True,
                deleted=False,
                username=username,
            )
        self.create_company_user(retail_user=retail_user)
        return retail_user

    def create(self):
        auth0_api = Auth0ManagementAPI()
        user = auth0_api.create_user(user_info=self.payload)
        self.create_retail_user(auth0_user=user)
        return user

    def invite_user(self):
        company = self.company
        payload = self.payload

        user_info_payload = {
            'email': payload['email'],
            'first_name': payload['first_name'],
            'last_name': payload['last_name'],
            'invite_status': RetailUser.UserInviteStatusChoices.INVITED.value,
            'is_active': True,
            'deleted': False,
        }
        user_exists = False
        try:
            user = RetailUser.include_deleted.get(email__iexact=payload['email'])
            user_exists = True
            for key, value in user_info_payload.items():
                setattr(user, key, value)
        except RetailUser.DoesNotExist:
            user = RetailUser.objects.create(
                **user_info_payload,
                username=payload['email']
            )

        self.create_company_user(retail_user=user)
        if not user_exists:
            sso_domains = [domain.lower() for domain in company.sso_domains]
            email_domain = user.email.split('@')[-1].lower()
            if email_domain not in sso_domains:
                CreateAuth0Account(
                    user=user,
                    company=company
                ).create_auth0_account()
        return user

    def create_admin_user(self, user):
        admin_user, _ = AdminUser.objects.get_or_create(
            user=user,
            company=self.company
        )

    def create_user(self, is_admin=False):
        company = self.company
        payload = self.payload

        user_info_payload = {
            'email': payload['email'],
            'first_name': payload['first_name'],
            'last_name': payload['last_name'],
            'invite_status': RetailUser.UserInviteStatusChoices.INVITED.value,
            'is_active': True,
            'deleted': False,
        }
        user_exists = False
        try:
            user = RetailUser.include_deleted.get(email__iexact=payload['email'])
            user_exists = True
            for key, value in user_info_payload.items():
                setattr(user, key, value)
        except RetailUser.DoesNotExist:
            user = RetailUser.objects.create(
                **user_info_payload,
                username=payload['email']
            )
        if is_admin:
            self.create_admin_user(user=user)

        self.create_company_user(retail_user=user)

        if not user_exists:
            sso_domains = [domain.lower() for domain in company.sso_domains]
            email_domain = user.email.split('@')[-1].lower()
            if email_domain not in sso_domains:
                CreateAuth0Account(
                    user=user,
                    company=company
                ).create_auth0_account()

        return user

    @staticmethod
    def create_user_without_invite(company, email, first_name, last_name, password):
        user_info_payload = {
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'invite_status': RetailUser.UserInviteStatusChoices.INVITED.value,
            'is_active': True,
            'deleted': False,
        }
        user_exists = False
        try:
            user = RetailUser.include_deleted.get(email__iexact=email)
            user_exists = True
            for key, value in user_info_payload.items():
                setattr(user, key, value)
        except RetailUser.DoesNotExist:
            user = RetailUser.objects.create(
                **user_info_payload,
                username=email
            )

        company_user, _ = CompanyUser.objects.get_or_create(
            user=user,
            company=company,
            # TODO: We need a flow to assign partner id to users that are not in db and log in from okta
            defaults={'partner_id': uuid.uuid4().hex}
        )

        if not user_exists:
            sso_domains = [domain.lower() for domain in company.sso_domains]
            email_domain = user.email.split('@')[-1].lower()
            if email_domain not in sso_domains:
                auth0_api = Auth0ManagementAPI()
                password = password
                payload = {'email': user.email, 'password': password, 'email_verified': True}
                auth0_api.create_user(user_info=payload)

        return user
