from api.eligibility_criteria.blocks_data.KR import KR_COUNTRY_CODE

FILLING_ACKNOWLEDGEMENT_CODE = 'fa'

KR_FILLING_ACKNOWLEDGEMENTS_BLOCK = [
    {
        'heading': 'SK Filling Acknowledgements',
        'block_id': f'{KR_COUNTRY_CODE.upper()}-{FILLING_ACKNOWLEDGEMENT_CODE.upper()}',
        'title': 'Do you agree that you are responsible for your own filings with the Bank of Korea and tax reporting, if required?',
        'country_code': 'KR',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{KR_COUNTRY_CODE}.{FILLING_ACKNOWLEDGEMENT_CODE}.1',
                    'text': "Yes, I agree that I am responsible for my own filings with the Bank of Korea and tax reporting, if required.",
                    'logical_value': True,
                    'is_financial': False,
                },
                {
                    'id': f'{KR_COUNTRY_CODE}.{FILLING_ACKNOWLEDGEMENT_CODE}.0',
                    'text': "No, I do not agree.",
                    'logical_value': False,
                }
            ]
        }
    }
]
