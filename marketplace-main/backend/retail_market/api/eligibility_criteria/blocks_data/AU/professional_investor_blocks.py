from api.eligibility_criteria.blocks_data.AU import AU_COUNTRY_CODE

PROFESSIONAL_INVESTOR_CODE = 'pi'

AU_PROFESSIONAL_INVESTOR_BLOCKS = [
    {
        'heading': 'AU Professional Investor Rules',
        'block_id': f'{AU_COUNTRY_CODE.upper()}-{PROFESSIONAL_INVESTOR_CODE.upper()}',
        'title': 'Are you a "professional investor"? A "professional investor" is any of the following. Please select one of the options below.',
        'description': 'Lorem ipsum dolor sit amet, consectetur',
        'country_code': 'AU',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{AU_COUNTRY_CODE}.{PROFESSIONAL_INVESTOR_CODE}.1',
                    'text': 'I hold an Australian financial services license.',
                    'requirement_text': 'Please upload a copy of your financial services license.',
                    'logical_value': True,
                    'require_files': True,
                    'require_internal_review': True,
                    'is_financial': True,
                    'enforce_financial_review': True
                },
                {
                    'id': f'{AU_COUNTRY_CODE}.{PROFESSIONAL_INVESTOR_CODE}.2',
                    'text': "I have or control gross assets of ≥AUD10M (including any assets held by an associate or under a trust that I manage).",
                    'requirement_text': 'Please upload a certified true copy of your bank or investment statement showing your gross assets of ≥AUD10M.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True
                },
                {
                    'id': f'{AU_COUNTRY_CODE}.{PROFESSIONAL_INVESTOR_CODE}.3',
                    'text': "I carry on a business of investment in financial products, interests in land or other investments; and for those purposes, invest funds received (directly or indirectly) following an offer or invitation to the public, the terms of which provided for the funds subscribed to be invested for those purposes.",
                    'requirement_text': 'Please upload a copy of the constitution of your business and a copy of the relevant product disclosure statement.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True
                },
                {
                    'id': f'{AU_COUNTRY_CODE}.{PROFESSIONAL_INVESTOR_CODE}.0',
                    'text': 'No, I am not a "professional investor".',
                    'logical_value': False
                }
            ]
        }
    }
]
