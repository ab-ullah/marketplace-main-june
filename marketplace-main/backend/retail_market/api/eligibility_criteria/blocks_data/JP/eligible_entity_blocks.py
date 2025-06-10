from api.eligibility_criteria.blocks_data.JP import JP_COUNTRY_CODE

ELIGIBLE_ENTITY_CODE = 'ee'

JP_ELIGIBLE_ENTITY_BLOCKS = [
    {
        'heading': 'JP Eligible Rules',
        'block_id': f'{JP_COUNTRY_CODE.upper()}-{ELIGIBLE_ENTITY_CODE.upper()}',
        'title': 'How are you investing?',
        'country_code': 'JP',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{JP_COUNTRY_CODE}.{ELIGIBLE_ENTITY_CODE}.1',
                    'text': "I am investing through a personal investment vehicle incorporated in Japan that \n (i) is a corporation and \n (ii) has capitalisation totaling JPY50 million or more.",
                    'requirement_text': 'Please upload the certificate of company registry or other constitutional documents evidencing that \n (i) your personal investment vehicle is incorporated in Japan and \n (ii) it has capitalisation totaling JPY50 million or more.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True
                },
                {
                    'id': f'{JP_COUNTRY_CODE}.{ELIGIBLE_ENTITY_CODE}.2',
                    'text': "I am investing through a personal investment vehicle incorporated in Japan that either \n (i) is not a corporation or \n (ii) does not have capitalisation totaling JPY50 million or more.",
                    'logical_value': False,
                    'require_files': False
                },
                {
                    'id': f'{JP_COUNTRY_CODE}.{ELIGIBLE_ENTITY_CODE}.3',
                    'text': "I am investing through an investment vehicle not incorporated in Japan.",
                    'requirement_text': 'Please upload the certificate of incorporation or other constitutional documents evidencing that your investment vehicle is incorporated outside Japan.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True
                },
                {
                    'id': f'{JP_COUNTRY_CODE}.{ELIGIBLE_ENTITY_CODE}.0',
                    'text': 'I am investing as an individual.',
                    'logical_value': True
                }
            ]

        }
    }
]
