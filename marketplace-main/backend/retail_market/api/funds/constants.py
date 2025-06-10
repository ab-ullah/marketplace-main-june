from api.transfers.constants import (INTEREST_BALANCE, INTEREST_DATE,
                                     LOAN_BALANCE, LOAN_DATE)
from api.workflows.models import Task

EMAIL_FIELD = 'email'
FIRST_NAME_FIELD = 'first_name'
LAST_NAME_FIELD = 'last_name'
JOB_BAND_FIELD = 'job_band'
DEPARTMENT_FIELD = 'department'
OFFICE_LOCATION_FIELD = 'office_location'
REGION_FIELD = 'region'
MAX_LEVERAGE_FIELD = 'max_leverage'
LEVERAGE = 'leverage_ratio'
LEVERAGE_OPTION_DESCRIPTION = 'leverage_option_description'
EQUITY_AMOUNT = 'amount'
RESTRICTED_TIME_PERIOD_FIELD = 'restricted_time_period'
RESTRICTED_GEOGRAPHIC_AREA_FIELD = 'restricted_geographic_area'
FINAL_EQUITY = 'final_amount'
FINAL_LEVERAGE = 'final_leverage'
TOTAL_INVESTMENT = 'total_investment'
VEHICLE = 'vehicle'
SHARE_CLASS = 'share_class'
INVESTOR_ACCOUNT_CODE = 'investor_account_code'
MAX_LEVERED_COMMITMENT_AMOUNT = 'max_levered_commitment_amount'

FINAL_AMOUNT_FIELDS = [
    FINAL_EQUITY,
    FINAL_LEVERAGE,
    TOTAL_INVESTMENT
]

APPLICATION_CUSTOM_FIELD_MAPPING = {
    FINAL_EQUITY: 'has_custom_equity',
    FINAL_LEVERAGE: 'has_custom_leverage',
    TOTAL_INVESTMENT: 'has_custom_total_investment',
}

INVITE_FILE_MAPPINGS = {
    'Email Address': EMAIL_FIELD,
    'First Name': FIRST_NAME_FIELD,
    'Last Name': LAST_NAME_FIELD,
    'Job Band/Level': JOB_BAND_FIELD,
    'Department': DEPARTMENT_FIELD,
    'Office Location': OFFICE_LOCATION_FIELD,
    'Region': REGION_FIELD,
    'Max Leverage Eligibility (ratio)': MAX_LEVERAGE_FIELD,
    'Leverage (ratio)': LEVERAGE,
    'Equity Amount': EQUITY_AMOUNT,
    'Restricted Time Period': RESTRICTED_TIME_PERIOD_FIELD,
    'Restricted Geographic Area': RESTRICTED_GEOGRAPHIC_AREA_FIELD,
    'Final Equity': FINAL_EQUITY,
    'Final Leverage': FINAL_LEVERAGE,
    'Leverage Description (must match fund setup exactly)': LEVERAGE_OPTION_DESCRIPTION,
    'Total Investment': TOTAL_INVESTMENT,
    'Vehicle (Optional)': VEHICLE,
    'Share Class (Optional)': SHARE_CLASS,
    'Investor Code (Optional)': INVESTOR_ACCOUNT_CODE,
    'Transfer Loan Date (Optional)': LOAN_DATE,
    'Transfer Loan Balance (Optional)': LOAN_BALANCE,
    'Accrued Interest Date (Optional)': INTEREST_DATE,
    'Accrued Interest Balance (Optional)': INTEREST_BALANCE,
    'Max Levered Commitment Amount (Optional)': MAX_LEVERED_COMMITMENT_AMOUNT,
}

PENDING_STATUS = 'Pending'
APPROVED_STATUS = 'Approved'
CHANGES_REQUESTED_STATUS = 'Changes Requested'
REJECTED_STATUS = 'Rejected'

TASK_STATUSES = {
    Task.StatusChoice.PENDING: PENDING_STATUS,
    Task.StatusChoice.APPROVED: APPROVED_STATUS,
    Task.StatusChoice.CHANGES_REQUESTED: CHANGES_REQUESTED_STATUS,
    Task.StatusChoice.REJECTED: REJECTED_STATUS,
}

CODE_TO_FILE_MAPPING = {v: k for k, v in INVITE_FILE_MAPPINGS.items()}

FUND_INTEREST_QUESTIONS = [
    {'question': 'Name', 'question_type': 'text'},
    {
        'question': 'Are you investing as an individual or an Entity?',
        'question_type': 'radio',
        'options': [
            {'label': 'Individual', 'value': 'individual'},
            {'label': 'Entity', 'value': 'entity'},
        ]
    },
    {'question': 'How much would you like to invest?', 'question_type': 'currency'},
]
INVALID_LEVERAGE = 1
