from api.eligibility_criteria.blocks_data.KR import KR_COUNTRY_CODE

REVERSE_INQUIRY_CODE = 'ri'

KR_REVERSE_INQUIRY_BLOCKS = [
    {
        'heading': 'KR Reverse Inquiry',
        'block_id': f'{KR_COUNTRY_CODE.upper()}-{REVERSE_INQUIRY_CODE.upper()}',
        'title': 'Is the investment scheme one where employees directly invest into the fund that is **not** managed locally?',
        'is_admin_only': True,
        'country_code': 'KR',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{KR_COUNTRY_CODE}.{REVERSE_INQUIRY_CODE}.1',
                    'text': "Yes",
                    'logical_value': True,
                    'is_financial': True,
                }
            ]
        }
    }
]
