import logging

from django.core.management.base import BaseCommand

from api.agreements.services.agreement_review_service import AgreementReview
from api.applications.models import Application
from api.funds.models import Fund

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Trigger agreements review flow'

    def add_arguments(self, parser):
        parser.add_argument('--fund_external_id', type=str, action='store')

    def handle(self, *args, **options):
        fund_external_id = options['fund_external_id']
        fund = Fund.objects.get(external_id=fund_external_id)

        applications = Application.objects.filter(fund=fund)
        for application in applications:
            logger.info(f'Processing application of user: {application.user.email}')
            AgreementReview(application=application).process()
