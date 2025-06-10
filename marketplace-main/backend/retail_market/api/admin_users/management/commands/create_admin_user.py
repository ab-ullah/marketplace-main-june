import logging

from django.core.management.base import BaseCommand

from api.admin_users.services.admin_user_service import CreateAdminUserService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Admin User'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, action='store')
        parser.add_argument('--company_name', type=str, action='store')
        parser.add_argument('--title', type=str, action='store')

    def handle(self, *args, **options):
        email = options.get('email')
        company_name = options.get('company_name')
        title = options.get('title')
        admin_service = CreateAdminUserService(email=email, company_name=company_name, title=title)
        admin_service.create()
