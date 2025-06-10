from api.eligibility_criteria.blocks_data.CN import CN_COUNTRY_CODE

TAX_FILINGS_CODE = 'tf'

TAX_FILINGS_BLOCKS = [
    {
        'heading': 'Tax Filings',
        'block_id': f'{CN_COUNTRY_CODE.upper()}-{TAX_FILINGS_CODE.upper()}',
        'title': 'Do you agree that you are responsible for your own tax filings with China tax bureau and foreign currency approval, if required?',
        'country_code': 'CN',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{CN_COUNTRY_CODE}.{TAX_FILINGS_CODE}.1',
                    'text': "Yes, I agree that I am responsible for my own tax filings with China tax bureau and foreign currency approval, if required.",
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'{CN_COUNTRY_CODE}.{TAX_FILINGS_CODE}.0',
                    'text': 'No, I do not agree.',
                    'logical_value': False
                }
            ]

        }
    },
]
