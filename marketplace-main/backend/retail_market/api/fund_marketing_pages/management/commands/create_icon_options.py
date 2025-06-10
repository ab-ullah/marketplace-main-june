from django.core.management import BaseCommand

from api.fund_marketing_pages.services.create_icons import CreateIconService


class Command(BaseCommand):
    help = 'Create fund blocks'

    def handle(self, *args, **options):
        CreateIconService.create()
