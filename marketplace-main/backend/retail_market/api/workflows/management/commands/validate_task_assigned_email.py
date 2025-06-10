import logging
from datetime import timedelta
from django.utils import timezone

from django.core.management.base import BaseCommand
from django.template.loader import render_to_string

from api.companies.models import Company
from api.libs.sendgrid.email import SendEmailService

from api.workflows.services.send_task_email import TASK_ASSIGNED_EMAIL_SUBJECT, TASK_ASSIGNED_EMAIL_MESSAGE
from api.libs.utils.urls import get_logo_url, get_admin_url

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'validate task assigned email'

    def add_arguments(self, parser):
        parser.add_argument('to', type=str)

    def handle(self, *args, **options):
        to = options.get('to')
        due_date = timezone.now() + timedelta(days=3)
        task_name = "Validation Approval"
        email_service = SendEmailService()
        company = Company.objects.get(slug='sidecar')

        context = {
            'task_name': task_name,
            'logo_url': get_logo_url(company=company),
            'admin_url': get_admin_url(),
            'task_due_date': due_date.date(),
        }

        body = render_to_string(TASK_ASSIGNED_EMAIL_MESSAGE, context).strip()
        email_service.send_html_email(
            to=to,
            subject=TASK_ASSIGNED_EMAIL_SUBJECT,
            body=body
        )
