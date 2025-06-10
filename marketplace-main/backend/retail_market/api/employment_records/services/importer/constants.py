EMAIL = 'email'
LAST_NAME = 'last_name'
FIRST_NAME = 'first_name'
EIN = 'ein'
BUSINESS_UNIT = 'business_unit'
BUSINESS_TITLE = 'title'
FUNCTIONAL_ROLE = 'functional_role'
HIRE_DATE = 'start_date'
SEPARATION_DATE = 'end_date'
MANAGER_EIN = 'manager_ein'
OFFICE_LOCATION = 'office_location'
COST_CENTER = 'cost_center'
INVESTOR_ACCOUNT_CODE = 'investor_account_code'


DATE_FIELDS = (HIRE_DATE, SEPARATION_DATE)

ORG_HIERARCHY_MAPPING = {
    'Last Name': LAST_NAME,
    'First Name': FIRST_NAME,
    'EIN': EIN,
    'Business Unit': BUSINESS_UNIT,
    'Business Title': BUSINESS_TITLE,
    'Position': FUNCTIONAL_ROLE,
    'Hire Date': HIRE_DATE,
    'Termination Date': SEPARATION_DATE,
    'Manager EIN': MANAGER_EIN,
    'Location - Name': OFFICE_LOCATION,
    'Email - Primary Work': EMAIL,
    'Cost Center': COST_CENTER,
    'Investor Account Number': INVESTOR_ACCOUNT_CODE,

}
