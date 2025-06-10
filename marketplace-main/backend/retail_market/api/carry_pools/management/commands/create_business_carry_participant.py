import logging

from django.core.management.base import BaseCommand

from api.carry_pools.models import CarryParticipant
from api.companies.models import Company
from api.users.models import RetailUser
from api.users.services.create_user import CreateUserService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create a business entity carry participant'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, action='store', required=True)
        parser.add_argument('--company_name', type=str, action='store', required=True)
        parser.add_argument('--business_name', type=str, action='store', required=True)

    def handle(self, *args, **options):
        company_name = options.get('company_name')
        email = options.get('email')
        business = options.get('business_name')

        company = Company.objects.filter(name__iexact=company_name).first()
        if not company:
            return

        payload = {'email': email}
        create_user_service = CreateUserService(payload=payload)
        create_user_service.create()

        retail_user = RetailUser.objects.get(email=email)
        carry_participant = CarryParticipant.objects.create(
            entity_name=business,
            company=company,
            entity=CarryParticipant.EntityType.CORPORATE.value
        )
        carry_participant.associate_with_user(retail_user)

        self.stdout.write('Business Carry Participant Created Successfully!')
