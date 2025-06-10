import logging

from django.conf import settings
from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.libs.auth0.management_api import Auth0ManagementAPI
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.generate_password import generate_secure_password
from api.libs.utils.urls import get_logo_url, get_start_page_url
from api.users.models import RetailUser

AUTH0_ACCOUNT_CREDENTIALS_EMAIL_MESSAGE = "email/auth0_acoount_credentials_email_message.html"
AUTH0_ACCOUNT_CREDENTIALS_EMAIL_SUBJECT = "[Action Required] Access to Sidecar"

logger = logging.getLogger(__name__)


class SendAuth0AccountCredentialsEmail:

    def __init__(self, user, change_password_url, company):
        self.user = user
        self.change_password_url = change_password_url
        self.company = company

    @staticmethod
    def async_send_account_credentials_email(user: RetailUser, change_password_url, company):
        try:
            email_service = SendEmailService()
            if user.is_admin_user():
                url = settings.ADMIN_APP_URL
            else:
                url = get_start_page_url(company=company)

            context = {
                'change_password_url': change_password_url,
                'email': user.email,
                'logo_url': get_logo_url(company=company),
                'dashboard_url': url
            }

            body = render_to_string(AUTH0_ACCOUNT_CREDENTIALS_EMAIL_MESSAGE, context).strip()
            # logger.info(body)
            email_service.send_html_email(
                to=user.email,
                subject=AUTH0_ACCOUNT_CREDENTIALS_EMAIL_SUBJECT,
                body=body
            )
        except Exception as e:
            logger.exception(e)

    def send_account_credentials_email(self):
        async_task(self.async_send_account_credentials_email, self.user, self.change_password_url, self.company)


class CreateAuth0Account:

    def __init__(self, user, company):
        self.user = user
        self.company = company

    @staticmethod
    def async_create_auth0_account(user, company):
        try:
            auth0_api = Auth0ManagementAPI()
            password = generate_secure_password()
            payload = {'email': user.email, 'password': password, 'email_verified': True}
            auth0_user = auth0_api.create_user(user_info=payload)
            ticket = auth0_api.change_password(auth0_user['user_id'])
            SendAuth0AccountCredentialsEmail(user=user, change_password_url=ticket['ticket'],
                                             company=company).send_account_credentials_email()
        except Exception as error:
            logger.exception(f'Unable to create auth0 account - [{str(error)}]')

    def create_auth0_account(self):
        async_task(self.async_create_auth0_account, self.user, self.company)
