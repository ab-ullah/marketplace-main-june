KNOWLEDGEABLE_EMPLOYEE_CODE = 'ke'

INVESTOR_BLOCKS = [
    {
        'heading': 'Knowledgeable Employee',
        'title': 'Are you a "knowledgeable employee"?',
        'description': 'Lorem ipsum dolor sit amet, consectetur',
        'block_id': KNOWLEDGEABLE_EMPLOYEE_CODE.upper(),
        'country_code': 'US',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{KNOWLEDGEABLE_EMPLOYEE_CODE}.1',
                    'text': 'Yes, I am a knowledgeable employee. A “knowledgeable employee” is either: (i) an executive officer (meaning the president, any vice president in charge of a principal business unit, division or function (such as sales, administration or finance), director, trustee, general partner, advisory board member, or person serving in a similar capacity of the investment manager or other affiliate of the Fund that manages, directly or indirectly, the investment activities of the general partner of the Fund; or (ii) an employee of the investment manager, general partner or other affiliated management company of the Fund (other than an employee performing solely clerical, secretarial or administrative functions with regard to such company or its investments) who, in connection with his or her regular functions or duties, participates in the investment activities of the Fund, other funds, or investment companies the investment activities of which are managed by the investment manager, general partner or such other affiliated management company of the Fund, provided that such employee has been performing such functions and duties for or on behalf of such fund, investment manager, general partner or such other affiliated management company, or substantially similar functions or duties for or on behalf of another company for at least 12 months.',
                    'logical_value': True,
                    'is_knowledgeable': True,
                    'is_financial': True,
                },
                {
                    'id': f'{KNOWLEDGEABLE_EMPLOYEE_CODE}.0',
                    'text': 'No, I am not a "knowledgeable employee"',
                    'logical_value': False,
                    'is_knowledgeable': False,
                },
            ]
        }
    },
    {
        'heading': 'Key Investment Information',
        'region_code': 'EU',
        'title': 'I have read the related Key Investment Information Document',
        'description': 'Lorem ipsum dolor sit amet, consectetur',
        'admin_uploaded_files': True,
        'allow_multiple_files': True,
        'block_id': 'KII'
    },
]
