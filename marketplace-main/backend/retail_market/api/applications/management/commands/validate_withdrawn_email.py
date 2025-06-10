import logging
from datetime import timedelta
from django.utils import timezone

from django.core.management.base import BaseCommand
from django.template.loader import render_to_string

from api.companies.models import Company
from api.libs.sendgrid.email import SendEmailService

from api.workflows.services.send_task_email import TASK_ASSIGNED_EMAIL_SUBJECT, TASK_ASSIGNED_EMAIL_MESSAGE
from api.libs.utils.urls import get_logo_url, get_admin_url
from api.applications.services.send_application_withdrawn_email import APPLICATION_UPDATED_EMAIL_MESSAGE

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'validate withdrawn email'

    def add_arguments(self, parser):
        parser.add_argument('to', type=str)
        parser.add_argument('fund_name', type=str)

    def handle(self, *args, **options):
        to = options.get('to')
        name = "Faye Fayerson"
        fund_name = options.get('fund_name')
        email_service = SendEmailService()
        company = Company.objects.get(slug='sidecar')
        context = {
            'logo_url': get_logo_url(company=company),
            'next_step_url': "https://investors.stage-hellosidecar.com",
            'fund_name': fund_name,
            'user_name': name,
            'comment': "Per your request we have updated the status of your application.",
        }

        body = render_to_string(APPLICATION_UPDATED_EMAIL_MESSAGE, context).strip()
        email_service.send_html_email(
            to=to,
            subject=f'{fund_name} Application Withdrawn',
            body=body
        )
