import http
import logging
import requests
import textwrap
import json

from django.conf import settings
from django.core.management.base import BaseCommand
from api.backup.services.dynamo_crm.dynamo_client import DynamoClient
from api.companies.services.company_service import LASALLE_COMPANY_NAME
from api.funds.models import Fund
import contextlib
from http.client import HTTPConnection


class HttpFormatter(logging.Formatter):
    def _formatHeaders(self, d):
        return '\n'.join(f'{k}: {v}' for k, v in d.items())

    def formatMessage(self, record):
        result = super().formatMessage(record)
        if record.name == __name__:
            try:
                body = json.loads(record.req.body)
            except ValueError:
                body = record.req.body
            result += textwrap.dedent(f'''
---------------- request ----------------
{record.req.method} {record.req.url}
{self._formatHeaders(record.req.headers)}
{body}
---------------- response ----------------
{record.res.status_code} {record.res.reason} {record.res.url}
{self._formatHeaders(record.res.headers)}
{record.res.text}
            ''')
        return result


formatter = HttpFormatter('{asctime} {levelname} {name} {message}', style='{')
handler = logging.StreamHandler()
handler.setFormatter(formatter)
logging.basicConfig(level=logging.DEBUG, handlers=[handler])
logger = logging.getLogger(__name__)
logger.addHandler(handler)


def log_roundtrip(response, *args, **kwargs):
    extra = {'req': response.request, 'res': response}
    logger.debug('HTTP roundtrip', extra=extra)


def debug_requests_on():
    """Switches on logging of the requests module."""
    HTTPConnection.debuglevel = 1

    logging.basicConfig()
    logging.getLogger().setLevel(logging.DEBUG)
    session = requests.Session()
    session.hooks['response'].append(log_roundtrip)

    def httpclient_log(*args):
        pass

    http.client.print = httpclient_log
    return session


def debug_requests_off():
    """Switches off logging of the requests module, might be some side-effects"""
    HTTPConnection.debuglevel = 0

    requests_log = logging.getLogger("requests.packages.urllib3")
    requests_log.setLevel(logging.WARNING)
    requests_log.propagate = False


@contextlib.contextmanager
def debug_requests(debug: bool):
    """Use with 'with'!"""
    session = requests.Session()
    if debug:
        session = debug_requests_on()
    yield session
    if debug:
        debug_requests_off()


class Command(BaseCommand):
    help = 'Backup everything regarding a fund'

    def add_arguments(self, parser):
        parser.add_argument('fund_id', type=int, help='ID of the fund to export to Dynamo, must be from Lasalle')
        parser.add_argument('--plan_only', action="store_true", help="Flag for dry run")
        parser.add_argument('--debug', action="store_true", help="Flag for verbose requests printing")
        parser.add_argument('--force', action="store_true", help="Bypass the check for Lasalle funds, specially useful for testing")

    def handle(self, *args, **options):
        fund_id = options.get('fund_id')
        plan_only = options.get('plan_only', False)
        debug = options.get('debug', False)
        force = options.get('force', False)
        fund = Fund.objects.get(pk=fund_id)
        if fund.company.name != LASALLE_COMPANY_NAME and not force:
            self.stderr.write(f"Fund id {fund_id} fund name {fund.name} does not belong to {LASALLE_COMPANY_NAME}")
            return

        applications = fund.approved_applications()

        with debug_requests(debug) as debug_session:
            dc = DynamoClient(session=debug_session, base_url=settings.DYNAMO_BASE_URL, api_key=settings.DYNAMO_API_KEY, plan_only=plan_only)
            results = dc.sync(applications, fund)

        self.stdout.write(f"Sync applications and documents for fund id:name {fund_id}:{fund.name}")
        self.stdout.write("Dynamo Client results")
        self.stdout.write(results.log_output())
