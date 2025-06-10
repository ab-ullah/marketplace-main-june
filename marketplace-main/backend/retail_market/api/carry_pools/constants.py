from collections import OrderedDict

DEFAULT_SALARY = 178000
DEFAULT_BONUS = 217000

DURATION_MAPPING = {
    'year': 'yearly',
    'quarter': 'quarterly',
    'biannual': 'biannually',
    'tri-annual': 'tri-annually',
    'month': 'monthly',
    'bi-month': 'bi-monthly',
    'fortnight': 'fortnightly',
    'week': 'weekly',
    'day': 'daily',
    'quinquennial': 'five-year period'
}

DURATION_MAX_DAYS_MAPPING = OrderedDict(
    [
        ('day', 1),
        ('week', 7),
        ('fortnight', 14),
        ('bi-month', 15),
        ('month', 31),
        ('quarter', 91),
        ('tri-annual', 121),
        ('year', 365),
        ('biannual', 730),
        ('quinquennial', 1825)
    ]
)

SUB_POOLS_FEATURE_FLAG = 'carry_subpools'
CARRY_PLAN_PUBLISH_FEATURE_FLAG = 'carry_plan_publish_flow'
CARRY_HURDLE_FEATURE = 'carry_hurdle'

EVEN_DILUTION = 'evenly'
PRO_RATA_DILUTION = 'pro-rata'

CARRY_APPROVE_ERROR_MSG = 'Request Denied! No User With Carry Approve Permission Found.'
