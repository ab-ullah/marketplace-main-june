FIRM = 'firm'
NOTICE_DATE = 'notice_date'
FUND = 'fund'
QUARTER = 'quarter'
CAPITAL_CALLED = 'capital_called'
DISTRIBUTED = 'distributed'
OTHER_ACTIVITY = 'other_activity'
NET_TRANSACTION = 'net_transaction'
NON_TAXABLE = 'non_taxable'
LTCG = 'ltcg'
STCG = 'stcg'
ORDINARY = 'ordinary'
DIVIDEND = 'dividend'
CHARACTER_UNKNOWN = 'character_unknown'
TOTAL_TAXABLE = 'total_taxable'
CONVERSION_RATE = 'conversion_rate'
CURRENCY = 'currency'


REPORTED_FAIR_MARKET_VALUE = 'reported_fair_market_value'
LEVERAGE_FUND_LINE = 'leverage_fund_line'
NET_ASSET_VALUE = 'net_asset_value'
ADJUSTED_VALUES = 'adjusted_values'
NET_ASSET_VALUE_USD = 'net_asset_value_usd'
REPORTED_UNFUNDED = 'reported_unfunded'
COMMITMENT = 'unfunded_commitment'
UNFUNDED_COMMITMENT_USD = 'unfunded_commitment_usd'

CURRENCY_COLUMNS = (
    CAPITAL_CALLED,
    DISTRIBUTED,
    OTHER_ACTIVITY,
    NET_TRANSACTION,
    NON_TAXABLE,
    LTCG,
    STCG,
    ORDINARY,
    DIVIDEND,
    CHARACTER_UNKNOWN,
    CONVERSION_RATE,
    TOTAL_TAXABLE
)

VALUATION_FILE_CURRENCY_COLUMNS = (
    REPORTED_FAIR_MARKET_VALUE,
    LEVERAGE_FUND_LINE,
    NET_ASSET_VALUE,
    ADJUSTED_VALUES,
    NET_ASSET_VALUE_USD,
    REPORTED_UNFUNDED,
    COMMITMENT,
    UNFUNDED_COMMITMENT_USD,
    CONVERSION_RATE
)

NOTICE_FILE_MAPPINGS = {
    'Firm': FIRM,
    'Notice Date': NOTICE_DATE,
    'Fund': FUND,
    'Capital Called': CAPITAL_CALLED,
    'Distributed': DISTRIBUTED,
    'Other Activity': OTHER_ACTIVITY,
    'Net Transaction': NET_TRANSACTION,
    'Non Taxable': NON_TAXABLE,
    'LTCG': LTCG,
    'STCG': STCG,
    'Ordinary/Interest': ORDINARY,
    'Dividend': DIVIDEND,
    'Character Unknown': CHARACTER_UNKNOWN,
    'QTR': QUARTER,
    'Total Taxable': TOTAL_TAXABLE,
    'Currency': CURRENCY,
    'Conversion Rate': CONVERSION_RATE
}

VALUATION_FILE_MAPPINGS = {
    'Firm': FIRM,
    'Fund': FUND,
    'Reported Fair Market Value': REPORTED_FAIR_MARKET_VALUE,
    'Leverage Fund Line': LEVERAGE_FUND_LINE,
    'Net Asset Value': NET_ASSET_VALUE,
    'Adjusted Values': ADJUSTED_VALUES,
    'Net Asset Value USD': NET_ASSET_VALUE_USD,
    'Reported Unfunded': REPORTED_UNFUNDED,
    'Unfunded Commitment': COMMITMENT,
    'Unfunded Commitment USD': UNFUNDED_COMMITMENT_USD,
    'Currency': CURRENCY,
    'Conversion Rate': CONVERSION_RATE,
    'QTR': QUARTER,
    'Notice Date': NOTICE_DATE,
}

NOTICE_TYPE_TRANSACTIONAL = 'transactional'
NOTICE_TYPE_VALUATION = 'valuation'
NOTICE_TYPE_COMPENSATION = 'compensation'
NOTICE_TYPE_ORGANIZATION = 'organization_chart'
