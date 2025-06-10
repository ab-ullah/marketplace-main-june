from api.eligibility_criteria.blocks_data.US import US_COUNTRY_CODE

QUALIFIED_PURCHASER_CODE = 'qp'

US_QUALIFIED_PURCHASER_BLOCKS = [
    {
        'heading': 'Qualified Purchaser',
        'block_id': f'{US_COUNTRY_CODE.upper()}-{QUALIFIED_PURCHASER_CODE.upper()}',
        'title': 'Are you a "qualified purchaser"? A "qualified purchaser" is any of the following. Please select one of the options below.',
        'country_code': 'US',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{US_COUNTRY_CODE}.{QUALIFIED_PURCHASER_CODE}.1',
                    'text': '(a) a natural person (including any person who will hold a joint, community property, or other similar shared ownership interest in the Fund with that person’s qualified purchaser spouse) who owns at least US$5,000,000 in Investments (as defined in the 1940 Act);',
                    'requirement_text': 'Please upload bank or investment statements in your name or the name of your spouse showing Investments (as defined under the 1940 Act) of US$5,000,000 or more.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{QUALIFIED_PURCHASER_CODE}.2',
                    'text': "(b) a company that owns at least US$5,000,000 in Investments (as defined in the 1940 Act) and that is owned directly or indirectly by or for two or more natural persons who are related as siblings or spouses (including former spouses), or direct lineal descendants by birth or adoption, spouses of such persons, the estates of such persons, or foundations, charitable organisations, or trusts established by or for the benefit of such persons (“Family Company”);",
                    'requirement_text': 'Please upload bank or investment statements in the name of the company showing Investments (as defined in the 1940 Act) of US$5,000,000 or more and organisational documents of the company showing ownership two or more natural persons who are related as siblings or spouses (including former spouses), or direct lineal descendants by birth or adoption, spouses of such persons, the estates of such persons, or foundations, charitable organisations, or trusts established by or for the benefit of such persons.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{QUALIFIED_PURCHASER_CODE}.3',
                    'text': "(c) a trust that is not covered by (b) and that was not formed for the specific purpose of acquiring the securities offered, as to which the trustee or other persons authorised to make decisions with respect to the trust, and each settlor or other person who has contributed assets to the trust, is a person described in (a), (b) or (d);",
                    'requirement_text': 'Please upload (i) the foundational documents of the trust showing all the trustees or other persons authorised to make decisions with respect to the trust and each settlor or other person who has contributed assets to the trust, (ii) bank or investment statements in the name of each of the persons described in (i) showing Investments (as defined in the 1940 Act) of US$5,000,000 or more, and (iii) the organisational documents of any company described in (i)',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{QUALIFIED_PURCHASER_CODE}.4',
                    'text': "(d) a person (including a company), acting for its own account or the accounts of other qualified purchasers, who in the aggregate owns and invests on a discretionary basis, not less than US$25,000,000 in Investments (as defined in the 1940 Act);",
                    'requirement_text': 'Please upload bank or investment statements in the name of the applicant showing Investments (as defined in the 1940 Act) of US$25,000,000 or more.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{QUALIFIED_PURCHASER_CODE}.5',
                    'text': "(e) a “Qualified Institutional Buyer” as defined in rule 144A under the 1933 Act (as that term is modified by the limitations imposed thereon by rule 2a51-1(g)(1) under the 1940 Act); or",
                    'logical_value': False,
                    'require_files': False,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{QUALIFIED_PURCHASER_CODE}.6',
                    'text': "(f) a company regardless of the amount of its Investments (as defined in the 1940 Act), each of the beneficial owners of which is a person described in (a), (b), (c), (d) or (e)",
                    'requirement_text': 'Please upload proof that all beneficial owners in the company are qualified purchasers by providing a certification from each beneficial owner of their qualified purchaser status and evidence thereof, including bank or investment statements in the name of each beneficial owner showing Investments (as defined in the 1940 Act) of US$5,000,000 or more and for companies or trusts, their organisational or foundational documents.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{QUALIFIED_PURCHASER_CODE}.0',
                    'text': 'No, I am not a "qualified purchaser".',
                    'logical_value': False,
                    'is_financial': False,
                    'is_knowledgeable': False,
                }
            ]
        }
    }
]
