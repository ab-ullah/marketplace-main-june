from api.eligibility_criteria.blocks_data.SG import SG_COUNTRY_CODE

ACCREDITED_INVESTOR_CODE = 'ai'

SG_ACCREDITED_INVESTOR_BLOCKS = [
    {
        'heading': 'SG Accredited Investor Rules',
        'title': 'The employee is an accredited investor',
        'block_id': f'{SG_COUNTRY_CODE.upper()}-{ACCREDITED_INVESTOR_CODE.upper()}',
        'country_code': 'SG',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{SG_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.1',
                    'text': """An "accredited investor" is defined under the SFA as: \n  (a)an individual – \n  (i)whose net personal assets exceed in value S$2 million (or its equivalent in a foreign currency) or such other amount as the Authority may prescribe in place of the first amount, of which the value of the individual’s primary residence (net of any secured loan) can only contribute up to S$1 million; \n  (ii)whose financial assets (net of any related liabilities) exceed in value S$1 million (or its equivalent in a foreign currency) or such other amount as the Authority may prescribe in place of the first amount, where "financial asset” means — \n  (1)a deposit as defined in section 4B of the Banking Act; \n (2)an investment product as defined in section 2(1) of the Financial Advisers Act; or \n (3)any other asset as may be prescribed by regulations made under section 341; or \n (iii)whose income in the preceding 12 months is not less than S$300,000 (or its equivalent in a foreign currency) or such other amount as the Authority may prescribe in place of the first amount;""",
                    'logical_value': True,
                    'is_financial': True
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.2',
                    'text': """b) a corporation with net assets exceeding S$10 million in value (or its equivalent in a foreign currency) or such other amount as the Authority may prescribe, in place of the first amount, as determined by — \n  (i)the most recent audited balance-sheet of the corporation; or \n  (ii)where the corporation is not required to prepare audited accounts regularly, a balance-sheet of the corporation certified by the corporation as giving a true and fair view of the state of affairs of the corporation as of the date of the balance sheet, which date shall be within the preceding 12 months;""",
                    'logical_value': True,
                    'is_financial': True
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.3',
                    'text': """(c) the trustee of: \n (i)any trust (including a bare trust) all the beneficiaries of which are accredited investors within the meaning of sub-paragraphs (a), (b), (d), (e), (f) or (g); \n  (ii)any trust (including a bare trust) all the settlors of which — \n  (A)are accredited investors within the meaning of sub-paragraphs (a), (b), (d), (e), (f) or (g); \n  (B)have reserved to themselves all powers of investment and asset management functions under the trust; and \n  (C)have reserved to themselves the power to revoke the trust; \n  (iii)any trust (including a bare trust) the subject matter of which exceeds S$10 million (or its equivalent in a foreign currency) in value;""",
                    'logical_value': True,
                    'is_financial': True
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.4',
                    'text': '(d) an entity (other than a corporation) with net assets exceeding S$10 million in value (or its equivalent in a foreign currency);',
                    'logical_value': True,
                    'is_financial': True
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.5',
                    'text': '(e) a partnership (other than a limited liability partnership) in which every partner is an accredited investor;',
                    'logical_value': True,
                    'is_financial': True
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.6',
                    'text': '(f) a corporation the entire share capital of which is owned by one or more persons, all of whom are accredited investors; or',
                    'logical_value': True,
                    'is_financial': True
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.7',
                    'text': '(g) a person who holds a joint account with an accredited investor, in respect of dealings through that joint account.',
                    'logical_value': True,
                    'is_financial': True
                },
                {
                    'id': f'{SG_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.0',
                    'text': 'I do not meet the criteria above',
                    'logical_value': False
                }
            ]

        }
    }
]
