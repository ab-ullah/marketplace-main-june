import logging
from datetime import timedelta
from django.utils import timezone


from django.core.management.base import BaseCommand
from django.template.loader import render_to_string

from api.companies.models import Company
from api.libs.sendgrid.email import SendEmailService
from api.funds.services.publish_fund import PUBLISHED_FUND_EMAIL_MESSAGE, \
    PUBLISHED_FUND_EMAIL_SUBJECT
from api.libs.utils.urls import get_dashboard_url, get_logo_url

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'validate fund published email'

    def add_arguments(self, parser):
        parser.add_argument('to', type=str)

    def handle(self, *args, **options):
        to = options.get('to')
        email_service = SendEmailService()
        company = Company.objects.get(slug='sidecar')

        context = {
            'fund_name': "LaSalle Global Employee Co-Investment Fund L.P. (LREDS IV)",
            'program_name': "LaSalle Global Employee Co-Investment",
            'dashboard_url': get_dashboard_url(),
            'support_email': 'employeecoinvest@lasalle.com',
            'logo_url': get_logo_url(company=company)
        }
        body = render_to_string(PUBLISHED_FUND_EMAIL_MESSAGE, context).strip()
        email_service.send_html_email(to=to,
                                      subject=PUBLISHED_FUND_EMAIL_SUBJECT,
                                      body=body)
