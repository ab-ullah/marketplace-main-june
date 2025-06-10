from django.conf import settings

from api.applications.models import Application
from api.capital_calls.models import CapitalCall
from api.companies.models import Company
from api.eligibility_criteria.models import FundEligibilityCriteria
from api.funds.models import Fund

FUNDS_BASE_URL = f'{settings.FE_APP_URL}/investor/funds'
INVESTOR_HOME_PAGE_URL = f'{settings.FE_APP_URL}/investor/start'
URL_KEY = 'url'
IS_WHITE_LABELLED_COMPANY_KEY = 'is_white_labelled_company'


def get_start_page_url(company: Company):
    if company and company.is_white_labelled_company:
        return f'{settings.PUBLIC_MARKET_PLACE_FE_APP_URL}/{company.slug}'
    return INVESTOR_HOME_PAGE_URL


def get_dashboard_url():
    return '{base}/investor/ownership'.format(
        base=settings.FE_APP_URL
    )


def get_base_url(fund_external_id):
    fund = Fund.objects.only('company').get(
        external_id=fund_external_id
    )
    company = fund.company
    if not company.is_white_labelled_company:
        return {URL_KEY: FUNDS_BASE_URL, IS_WHITE_LABELLED_COMPANY_KEY: False}
    return {URL_KEY: f'{settings.FE_APP_URL}/{company.slug}/investor/funds', IS_WHITE_LABELLED_COMPANY_KEY: True}


def update_query_string(url, is_white_labelled):
    if not is_white_labelled:
        return url

    return f'{url}?mp=true'


def get_onboard_flow_url(fund_external_id, page_suffix):
    url_info = get_base_url(fund_external_id=fund_external_id)
    base_url = url_info[URL_KEY]
    is_white_labelled = url_info[IS_WHITE_LABELLED_COMPANY_KEY]
    url = f'{base_url}/{fund_external_id}/{page_suffix}'
    return update_query_string(url=url, is_white_labelled=is_white_labelled)


def get_aml_kyc_url(fund_external_id):
    return get_onboard_flow_url(fund_external_id=fund_external_id, page_suffix='amlkyc')


def get_eligibility_url(fund_external_id):
    return get_onboard_flow_url(fund_external_id=fund_external_id, page_suffix='onboarding')


def get_tax_record_url(fund_external_id):
    return get_onboard_flow_url(fund_external_id=fund_external_id, page_suffix='tax')


def get_bank_detail_url(fund_external_id):
    return get_onboard_flow_url(fund_external_id=fund_external_id, page_suffix='bank_details')


def get_review_docs_url(fund_external_id):
    return get_onboard_flow_url(fund_external_id=fund_external_id, page_suffix='review_docs')


def get_program_docs_url(fund_external_id):
    return get_onboard_flow_url(fund_external_id=fund_external_id, page_suffix='program_doc')


def get_agreements_url(fund_external_id):
    return get_onboard_flow_url(fund_external_id=fund_external_id, page_suffix='agreements')


def get_bank_details_url(fund_external_id):
    return get_onboard_flow_url(fund_external_id=fund_external_id, page_suffix='bank_details')


def get_capital_call_url(capital_call: CapitalCall):
    return '{base}/investor/capital-call/{uuid}'.format(
        base=settings.FE_APP_URL,
        uuid=capital_call.uuid
    )


def get_fund_application_url(fund_external_id: str):
    return get_onboard_flow_url(fund_external_id=fund_external_id, page_suffix='application')


def get_admin_url():
    return '{base}/admin/tasks/'.format(
        base=settings.ADMIN_APP_URL
    )


def get_admin_application_url(application: Application):
    return f'{settings.ADMIN_APP_URL}/admin/funds/{application.fund.external_id}/applicants/{application.id}'


def get_admin_eligibility_criteria_url(eligibility_criteria: FundEligibilityCriteria):
    return f'{settings.ADMIN_APP_URL}/admin/eligibility/{eligibility_criteria.id}/edit'


def get_logo_url(company: Company):
    if not company.is_white_labelled_company:
        return "https://assets.hellosidecar.com/static/sidecar/logo.png"

    if company.logo:
        return company.logo.url


def get_carry_docs_url():
    return '{base}/investor/carry-plans/documents/acknowledgment'.format(
        base=settings.FE_APP_URL
    )
