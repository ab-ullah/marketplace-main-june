import json
import logging

from django.core.management.base import BaseCommand

from api.users.services.create_user import CreateUserService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create user'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str)
        parser.add_argument('first_name', type=str)
        parser.add_argument('last_name', type=str)
        parser.add_argument('--is_admin', action="store_true")

    def handle(self, *args, **options):
        payload = {'email': options.get('email'), "first_name": options.get('first_name'), "last_name": options.get('last_name')}
        create_user_service = CreateUserService(payload=payload)
        user = create_user_service.create_user(is_admin=options.get('is_admin', False))
        print(json.dumps(user.__dict__, indent=4))
