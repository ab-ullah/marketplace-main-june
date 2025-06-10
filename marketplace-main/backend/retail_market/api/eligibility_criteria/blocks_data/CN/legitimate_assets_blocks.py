from api.eligibility_criteria.blocks_data.CN import CN_COUNTRY_CODE

LEGITIMATE_OVERSEA_ASSETS_CODE = 'loa'

CN_LEGITIMATE_ASSETS_BLOCKS = [
    {
        'heading': 'CN Legitimate Oversea Assets',
        'block_id': f'{CN_COUNTRY_CODE.upper()}-{LEGITIMATE_OVERSEA_ASSETS_CODE.upper()}',
        'title': 'Are you investing funds from only legitimate oversea assets/loans?',
        'country_code': 'CN',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{CN_COUNTRY_CODE}.{LEGITIMATE_OVERSEA_ASSETS_CODE}.1',
                    'text': "Yes, my invested funds are from only legitimate oversea assets/loan.",
                    'requirement_text': 'Please upload a certified true copy of your foreign bank or investment statement showing the investment portfolio that you are using to make this investment.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True
                },
                {
                    'id': f'{CN_COUNTRY_CODE}.{LEGITIMATE_OVERSEA_ASSETS_CODE}.0',
                    'text': 'I do not meet the criteria above.',
                    'logical_value': False
                }
            ]

        }
    },
]
