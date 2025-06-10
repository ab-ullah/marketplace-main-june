from api.eligibility_criteria.blocks_data.AU import AU_COUNTRY_CODE

WHOLESALE_CLIENT_CODE = 'wc'

AU_WHOLESALE_CLIENT_BLOCKS = [
    {
        'heading': 'AU Wholesale Client Rules',
        'block_id': f'{AU_COUNTRY_CODE.upper()}-{WHOLESALE_CLIENT_CODE.upper()}',
        'title': 'Are you a "wholesale client"?',
        'country_code': 'AU',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{AU_COUNTRY_CODE}.{WHOLESALE_CLIENT_CODE}.1',
                    'text': "Yes I am a \"wholesale client \" by virtue of my experience as an investor. \n I have previous experience in using financial services and investing in financial products that allows me to assess:\n(a) the merits of the product or service; and \n (b) the value of the product or service; and \n (c) the risks associated with holding the product; and \n (d) my own information needs; and \n (e) the adequacy of the information given by the licensee and the product issuer.",
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'{AU_COUNTRY_CODE}.{WHOLESALE_CLIENT_CODE}.0',
                    'text': 'No, I am not a "wholesale client".',
                    'logical_value': False
                }
            ]

        }
    }
]
