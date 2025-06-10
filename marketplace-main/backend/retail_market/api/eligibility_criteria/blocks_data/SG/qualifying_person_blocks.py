from api.eligibility_criteria.blocks_data.SG import SG_COUNTRY_CODE

QUALIFYING_PERSON_CODE = 'qp'

SG_QUALIFYING_PERSON_BLOCKS = [
    {
        'heading': 'SG Qualifying Person Rules',
        'title': 'Is the employee a qualifying person',
        'block_id': f'{SG_COUNTRY_CODE.upper()}-{QUALIFYING_PERSON_CODE.upper()}',
        'country_code': 'SG',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{SG_COUNTRY_CODE}.{QUALIFYING_PERSON_CODE}.1',
                    'text': """1 "Qualifying Person" means an employee who is a bona fide director or equivalent person, former director or equivalent person, consultant, adviser, employee or former employee of the entity or a related corporation of that entity (being a corporation) \n 2 "related corporations” means a corporation which \n (a) is the holding company of another corporation; \n(b) is a subsidiary of another corporation; or \n(c) is a subsidiary of the holding company of another corporation. \n 3 a corporation is a "subsidiary” of a corporation if \n(a) the other corporation controls composition of its board, or \n(b) the other corporation holds more than half of its voting power, or \n(c) it is a subsidiary of the other corporation’s subsidiary.""",
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{QUALIFYING_PERSON_CODE}.0',
                    'text': 'I do not meet the criteria above',
                    'logical_value': False
                }
            ]

        }
    }
]
