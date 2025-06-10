import logging

from django.core.management.base import BaseCommand
from django.template.loader import render_to_string

from api.companies.models import Company
from api.libs.sendgrid.email import SendEmailService
from api.partners.services.auth0_account_service import AUTH0_ACCOUNT_CREDENTIALS_EMAIL_SUBJECT, AUTH0_ACCOUNT_CREDENTIALS_EMAIL_MESSAGE
from api.libs.utils.urls import get_logo_url, get_dashboard_url

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'validate capital call email'

    def add_arguments(self, parser):
        parser.add_argument('to', type=str)

    def handle(self, *args, **options):
        to = options.get('to')
        company = Company.objects.get(slug='sidecar')

        email_service = SendEmailService()
        context = {
            'password': 'example123',
            'email': to,
            'logo_url': get_logo_url(company=company),
            'dashboard_url': get_dashboard_url()
        }

        body = render_to_string(AUTH0_ACCOUNT_CREDENTIALS_EMAIL_MESSAGE, context).strip()

        email_service.send_html_email(
            to=to,
            subject=AUTH0_ACCOUNT_CREDENTIALS_EMAIL_SUBJECT,
            body=body
        )


