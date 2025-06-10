from api.eligibility_criteria.blocks_data.AU import AU_COUNTRY_CODE

SOPHISTICATED_INVESTOR_CODE = 'si'

AU_SOPHISTICATED_INVESTOR_BLOCKS = [
    {
        'heading': 'AU Sophisticated Investor Rules',
        'block_id': f'{AU_COUNTRY_CODE.upper()}-{SOPHISTICATED_INVESTOR_CODE.upper()}',
        'title': 'Are you a "sophisticated investor"?',
        'description': 'Lorem ipsum dolor sit amet, consectetur',
        'country_code': 'AU',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{AU_COUNTRY_CODE}.{SOPHISTICATED_INVESTOR_CODE}.1',
                    'text': 'Yes, I am a "sophisticated investor" because: \n (a) I am purchasing securities ≥ AUD500K; and \n (b) I am purchasing securities and the amount payable on acceptance of the offer and amounts previously paid by me for the body\'s securities of the same class add up to ≥AUD500K; and \n  (c) I have (as evidenced by a certificate given by a qualified accountant no more than two years before the offer of these securities): (i) net assets of  ≥AUD2.5M (the net assets of a company or trust controlled by me may be included); or (ii) a gross income for each of the last two financial years of  ≥AUD250K/year (the gross income of a company or trust controlled by me may be included).',
                    'requirement_text': 'Please upload a certificate from a qualified accountant dated not more than two years ago, showing you have \n (i) net assets of ≥AUD2.5M (the net assets of a company or trust controlled by you may be included); or \n (ii) a gross income for each of the last two financial years of ≥AUD250K/year (the gross income of a company or trust controlled by you may be included).',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True
                },
                {
                    'id': f'{AU_COUNTRY_CODE}.{SOPHISTICATED_INVESTOR_CODE}.0',
                    'text': 'No, I am not a "sophisticated investor"',
                    'logical_value': False
                }
            ]
        }
    }
]
