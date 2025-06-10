import logging
from datetime import timedelta
from django.utils import timezone


from django.core.management.base import BaseCommand
from django.template.loader import render_to_string

from api.companies.models import Company
from api.libs.sendgrid.email import SendEmailService
from api.capital_calls.models import CapitalCall
from api.capital_calls.services.create_capital_call_notification import CAPITAL_CALL_EMAIL_MESSAGE, \
    CAPITAL_CALL_EMAIL_SUBJECT
from api.libs.utils.urls import get_capital_call_url, get_logo_url, get_dashboard_url

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'validate capital call email'

    def add_arguments(self, parser):
        parser.add_argument('to', type=str)

    def handle(self, *args, **options):
        to = options.get('to')
        due_date = timezone.now() + timedelta(days=30)

        email_service = SendEmailService()
        capital_call = CapitalCall()
        company = Company.objects.get(slug='sidecar')
        context = {
            'fund_name': "LaSalle Global Employee Co-Investment Fund L.P. (LREDS IV)",
            'program_name': "LaSalle Global Employee Co-Investment",
            'dashboard_url': get_dashboard_url(),
            'support_email': 'employeecoinvest@lasalle.com',
            'due_date': due_date.strftime("%b %d, %Y"),
            'notification_url': get_capital_call_url(capital_call),
            'logo_url': get_logo_url(company=company)
        }
        body = render_to_string(CAPITAL_CALL_EMAIL_MESSAGE, context).strip()
        email_service.send_html_email(to=to,
                                      subject=CAPITAL_CALL_EMAIL_SUBJECT,
                                      body=body)
