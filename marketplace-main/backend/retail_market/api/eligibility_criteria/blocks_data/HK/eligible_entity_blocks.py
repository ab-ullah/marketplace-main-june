from api.eligibility_criteria.blocks_data.HK import HK_COUNTRY_CODE

ELIGIBLE_HK_CODE = 'eb'

HK_ELIGIBLE_SMART_BLOCKS = [
    {
        'heading': 'Eligibility Smart Block for Hong Kong',
        'block_id': f'{HK_COUNTRY_CODE.upper()}-{ELIGIBLE_HK_CODE.upper()}',
        'title': 'How are you a Professional Investor?',
        'country_code': 'HK',
        'options': {
            'admin_options': [
                {
                    'id': f'admin-{HK_COUNTRY_CODE}.{ELIGIBLE_HK_CODE}.1',
                    'text': "Is the Offering non-public",
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'admin-{HK_COUNTRY_CODE}.{ELIGIBLE_HK_CODE}.2',
                    'text': "Will the offering be offered to 50 persons or fewer in Hong Kong",
                    'logical_value': True,
                    'is_financial': True,
                },
            ],
            'entity': [],
            'individual': [
                {
                    'id': f'{HK_COUNTRY_CODE}.{ELIGIBLE_HK_CODE}.1',
                    'text': '(a) institutional professional investors',
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'{HK_COUNTRY_CODE}.{ELIGIBLE_HK_CODE}.2',
                    'text': '(b) regulated investment business professionals',
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'{HK_COUNTRY_CODE}.{ELIGIBLE_HK_CODE}.3',
                    'text': '(c) regulated banks, regulated insurers, authorised collective investment schemes, regulated pension schemes and governments; substantial trusts meeting a HK$40 million minimum asset requirement;',
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'{HK_COUNTRY_CODE}.{ELIGIBLE_HK_CODE}.4',
                    'text': '(d) high net worth individuals meeting an investment portfolio of ≥HKD8M',
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'{HK_COUNTRY_CODE}.{ELIGIBLE_HK_CODE}.0',
                    'text': 'I do not meet any of the above criteria',
                    'logical_value': False
                },
            ]
        }
    }
]
