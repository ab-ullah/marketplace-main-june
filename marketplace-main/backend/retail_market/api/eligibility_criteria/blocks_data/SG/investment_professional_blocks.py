from api.eligibility_criteria.blocks_data.SG import SG_COUNTRY_CODE

INVESTMENT_PROFESSIONAL_CODE = 'IP'

SG_INVESTMENT_PROFESSIONAL_BLOCKS = [
    {
        'heading': 'SG Investment Professional Rules',
        'title': 'Employee is an investment professional',
        'block_id': f'{SG_COUNTRY_CODE.upper()}-{INVESTMENT_PROFESSIONAL_CODE.upper()}',
        'country_code': 'SG',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{SG_COUNTRY_CODE}.{INVESTMENT_PROFESSIONAL_CODE}.1',
                    'text': """Acknowledgement of risks -- Employee must be apprised of risks involved with investments, and acknowledge in writing that they would not be accorded the regulatory safeguards as a retail investor""",
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{INVESTMENT_PROFESSIONAL_CODE}.2',
                    'text': """Acknowledgement of policy regarding investments in the event of employment cessation -- Once employee ceases employment with the FMC or corporate group, they must not be allowed to make further investments into the funds managed by the FMC. Prior to employee’s investment, employee must agree to and acknowledge FMC’s clear policy regarding the treatment or handling of such employee’s investments in the event of cessation of employment (including whether they will be allowed to remain invested or redeem their existing contributions, be restricted from making further contributions or be required to fulfil existing commitments).""",
                    'logical_value': True,
                    'is_financial': True,
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{INVESTMENT_PROFESSIONAL_CODE}.0',
                    'text': 'I do not meet the criteria above',
                    'logical_value': False
                }
            ]

        }
    }
]
