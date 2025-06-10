from api.eligibility_criteria.blocks_data.US import US_COUNTRY_CODE

ACCREDITED_INVESTOR_CODE = 'ai'

US_ACCREDITED_INVESTOR_BLOCKS = [
    {
        'heading': 'US Accredited Investor Rules',
        'block_id': f'{US_COUNTRY_CODE.upper()}-{ACCREDITED_INVESTOR_CODE.upper()}',
        'title': 'Are you an "accredited investor"? An "accredited investor" is any of the following. Please select one of the options below.',
        'description': 'Lorem ipsum dolor sit amet, consectetur',
        'country_code': 'US',
        'options': {
            'entity': [],
            'individual': [
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.1',
                    'text': '(a - 1) A natural person (or the grantor, in the case of a revocable grantor trust) who had an individual income in excess of US$200,000 for each of the last two years and who reasonably expects to reach the same income level in the current year.',
                    'acknowledgement_text': 'I hereby certify that I have met the individual income requirement in excess of $200,000 for each of the last two years and have a reasonable expectation that I will reach the same income level in the current year.',
                    'logical_value': True,
                    'require_acknowledgement': True,
                    'is_knowledgeable': False,
                    'is_financial': True,
                    'enforce_financial_review': True
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.2',
                    'text': "(a - 2) A natural person (or the grantor, in the case of a revocable grantor trust) who has a joint income with their spouse or spousal equivalent in excess of US $300,000 in each of the last two years and reasonably expects to reach the same income level in the current year.",
                    'requirement_text': 'Please upload your and your spouse\'s W2 or tax return showing proof of your collective income for the past two years.',
                    'logical_value': True,
                    'require_files': True,
                    'is_knowledgeable': False,
                    'is_financial': True,
                    'enforce_financial_review': True
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.3',
                    'text': "(b) A natural person (or the grantor, in the case of a revocable grantor trust) whose individual net worth (or whose joint net worth with their spouse or spousal equivalent) exceeds US$1,000,000, excluding the value of the individual's primary residence.",
                    'requirement_text': 'Please upload a credit report and investment statements to verify minimum of $1,000,000 net worth.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True,
                    'is_knowledgeable': False,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.4',
                    'text': "(c) A natural person (or the grantor, in the case of a revocable grantor trust) who holds in good standing a Series 7, 65 and/or 82 license and/or such other professional certification(s) or designation(s) or credential(s) from an accredited educational institution that the Securities and Exchange Commission has designated as qualifying an individual for accredited investor status.",
                    'requirement_text': 'Please upload a copy of your Series 7, 65 and/or 82 license, BrokerCheck report downloaded from FINRA website and/or other evidence of your professional certification(s) or designation(s) or credential(s).',
                    'logical_value': True,
                    'require_files': True,
                    'has_selector_options': True,
                    'is_knowledgeable': True,
                    'is_financial': False,
                    'options': [
                        {'value': 'series 7 license', 'label': 'Series 7 License'},
                        {'value': 'series 65 and/or 82 license', 'label': 'Series 65 and/or 82 License'},
                        {
                            'value': 'other professional certification(s) or designation(s) or credential(s)',
                            'label': 'Other Professional Certification(s) or Designation(s) or Credential(s)',
                            'require_text_details': True
                        },
                    ]
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.5',
                    'text': "(d) A natural person (or the grantor, in the case of a revocable grantor trust) who is a “knowledgeable employee”. A ""knowledgeable employee"" is either: (i) an executive officer (meaning the president, any vice president in charge of a principal business unit, division or function (such as sales, administration or finance), director, trustee, general partner, advisory board member, or person serving in a similar capacity of the investment manager or other affiliate of the Fund that manages, directly or indirectly, the investment activities of the general partner of the Fund; or (ii) an employee of the investment manager, general partner or other affiliated management company of the Fund (other than an employee performing solely clerical, secretarial or administrative functions with regard to such company or its investments) who, in connection with his or her regular functions or duties, participates in the investment activities of the Fund, other funds, or investment companies the investment activities of which are managed by the investment manager, general partner or such other affiliated management company of the Fund, provided that such employee has been performing such functions and duties for or on behalf of such fund, investment manager, general partner or such other affiliated management company, or substantially similar functions or duties for or on behalf of another company for at least 12 months.",
                    'requirement_text': '',
                    'logical_value': True,
                    'require_files': False,
                    'is_knowledgeable': True,
                    'is_financial': False,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.6',
                    'text': "(e) A corporation, a limited liability company, an organisation described in section 501(c)(3) of the Code, a Massachusetts or similar business trust, in each case not formed for the specific purpose of investing in the Fund and with total assets in excess of US$5,000,000.",
                    'requirement_text': 'Please upload proof of your investment vehicle''s 501(c)(3) status as well as bank or investment statements showing proof of assets in excess of US$5,000,000.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True,
                    'is_knowledgeable': False,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.7',
                    'text': "(f) A personal (non-business) trust, other than an employee benefit trust, with total assets in excess of US$5,000,000, not formed for the specific purpose of investing in the Fund, whose purchase is directed by persons having such knowledge and experience in financial and business matters that they are capable of evaluating the merits and risks of the prospective investment.",
                    'requirement_text': 'Please upload bank or investment statements in the name of the personal trust showing assets in excess of US$5,000,000 and evidence of the controlling person''s certification and experience in financial business matters.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True,
                    'is_knowledgeable': False,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.8',
                    'text': "(g) A “family office,” as defined in Rule 202(a)(11)(G)-1 under the Advisers Act, not formed for the specific purpose of investing in the Fund, with total assets under management in excess of US$5,000,000 and whose prospective investment is directed by a person who has such knowledge and experience in financial and business matters that such family office is capable of evaluating the merits and risks of the prospective investment.",
                    'requirement_text': 'Please upload bank or investment statements in the name of the family office showing assets in excess of US$5,000,000 and evidence of the controlling person''s certification and experience in financial business matters.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True,
                    'is_knowledgeable': False,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.9',
                    'text': "(h) A “family client,” as defined in Rule 202(a)(11)(G)-1 under the Advisers Act, of a family office meeting the requirements in clause (g) and whose prospective investment in the Fund is directed by such family office by a person who has such knowledge and experience in financial and business matters that such family office is capable of evaluating the merits and risks of the prospective investment.",
                    'requirement_text': 'Please upload bank or investment statements in the name of the family client showing assets in excess of US$5,000,000 and evidence of the controlling person''s certification and experience in financial business matters.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True,
                    'is_knowledgeable': False,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.10',
                    'text': "(i) An entity, of a type not listed in clauses (e) - (f) or (j), in each case not formed for the specific purpose of investing in the Fund, with total Investments (as defined under the 1940 Act) in excess of US$5,000,000.",
                    'requirement_text': 'Please upload bank or investment statements in the name of the entity showing Investments (as defined under the 1940 Act) in excess of US$5,000,000.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True,
                    'is_knowledgeable': False,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.11',
                    'text': '(j) An entity in which all of the equity owners are “accredited investors".',
                    'requirement_text': 'Please upload proof that all equity owners in the entity are accredited investors by providing either (i) a letter from a certified public accountant, lawyer, financial advisor, or stockbroker certifying the entity''s accredited investor status, or (ii) a certified true copy of the each equity owner''s certification of their accredited investor status and evidence thereof.',
                    'logical_value': True,
                    'require_files': True,
                    'is_financial': True,
                    'enforce_financial_review': True,
                    'is_knowledgeable': False,
                },
                {
                    'id': f'{US_COUNTRY_CODE}.{ACCREDITED_INVESTOR_CODE}.0',
                    'text': 'No, I am not an "accredited investor".',
                    'logical_value': False,
                    'is_financial': False,
                    'is_knowledgeable': False,
                }
            ]
        }
    }
]
