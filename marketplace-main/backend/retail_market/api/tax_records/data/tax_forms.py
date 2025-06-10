from api.tax_records.models import TaxFormType

TAX_FORMS = [
    {'form_id': 'W-8BEN', 'file_name': 'W-8BEN-10.2021.pdf', 'version': '10.2021', 'type': TaxFormType.GOVERMENT,
     'description': 'Certificate of Foreign Status of Beneficial Owner for United States Tax Withholding and Reporting (Individuals)',
     'help_link': 'https://www.irs.gov/pub/irs-pdf/iw8ben.pdf',
     'details': """Give Form W-8 BEN to the withholding agent or payer if you are a foreign person and you are the beneficial owner of 
                    an amount subject to withholding.<br/>
                    Submit Form W-8 BEN when requested by the withholding agent or payer whether or not you are claiming a reduced rate of,
                    or exemption from, withholding.<br/>
                    <br/>More information: <br/> <a href='https://www.irs.gov/forms-pubs/about-form-w-8-ben'> 
                    https://www.irs.gov/forms-pubs/about-form-w-8-ben </a>
                """},
    {'form_id': 'W-8BEN-E', 'file_name': 'W-8BEN-E-10.2021.pdf', 'version': '10.2021', 'type': TaxFormType.GOVERMENT,
     'description': 'Certificate of Status of Beneficial Owner for United States Tax Withholding and Reporting (Entities)',
     'help_link': 'https://www.irs.gov/pub/irs-pdf/iw8bene.pdf',
     'details': """Form W-8 BEN-E is used by foreign entities to document their status for purposes of chapter 3 and chapter 4, 
                    as well as other code provisions.<br/>
                    <br/>More information: <br/> <a href='https://www.irs.gov/forms-pubs/about-form-w-8-ben-e'> 
                    https://www.irs.gov/forms-pubs/about-form-w-8-ben-e </a>"""},
    {'form_id': 'W-8ECI', 'file_name': 'W-8ECI-10.2021.pdf', 'version': '10.2021', 'type': TaxFormType.GOVERMENT,
     'description': 'Certificate of Foreign Person\'s Claim That Income Is Effectively Connected With the Conduct of a Trade or Business in the United States',
     'help_link': 'https://www.irs.gov/pub/irs-pdf/iw8eci.pdf',
     'details': """ You must give Form W-8 ECI to the withholding agent or payer if you are a foreign person and you are the beneficial owner of U.S. source 
                    income that is (or is deemed to be) effectively connected with the conduct of a trade or business within the United States.<br/>
                    <br/>More information: <br/> <a href='https://www.irs.gov/forms-pubs/about-form-w-8-eci'>
                    https://www.irs.gov/forms-pubs/about-form-w-8-eci</a>       
                """},
    {'form_id': 'W-8EXP', 'file_name': 'W-8EXP-07.2017.pdf', 'version': '07.2017', 'type': TaxFormType.GOVERMENT,
     'help_link': 'https://www.irs.gov/pub/irs-pdf/iw8exp.pdf',
     'description': 'Certificate of Foreign Government or Other Foreign Organization for United States Tax Withholding and Reporting',
     'details': """If you receive certain types of income, you must provide Form W-8 EXP to:<br/>
                    <ul style="list-style-type: disc !important;">
                        <li>Establish that you are not a U.S. person.</li>
                        <li>Claim that you are the beneficial owner of the income for which Form W-8 EXP is given.</li>
                        <li>Claim a reduced rate of, or exemption from, withholding as a foreign government, international organization, 
                        foreign central bank of issue, foreign tax-exempt organization, foreign private foundation, or government of a U.S. possession.</li>
                    </ul>
                    More information: <br/> <a href='https://www.irs.gov/forms-pubs/about-form-w-8-exp'>
                    https://www.irs.gov/forms-pubs/about-form-w-8-exp</a>
                """},
    {'form_id': 'W-9', 'file_name': 'W-9-03.2024.pdf', 'version': '03.2024', 'type': TaxFormType.GOVERMENT,
     'help_link': 'https://www.irs.gov/pub/irs-pdf/iw9.pdf',
     'description': 'Request for Taxpayer Identification Number and Certification',
     'details': """Use Form W-9 to provide your correct Taxpayer Identification Number (TIN) to the person who is required to file an 
                    information return with the IRS to report, for example:<br/>
                    <ul style="list-style-type: disc !important;">
                        <li>Income paid to you.</li>
                        <li>Real estate transactions.</li>
                        <li>Mortgage interest you paid.</li>
                        <li>Acquisition or abandonment of secured property.</li>
                        <li>Cancellation of debt.</li>
                        <li>Contributions you made to an IRA.</li>
                    </ul>
                    More information: <br/> <a href='https://www.irs.gov/forms-pubs/about-form-w-9'> https://www.irs.gov/forms-pubs/about-form-w-9</a>
                """},
    {'form_id': 'W-8IMY', 'file_name': 'W-8IMY-06.2017.pdf', 'version': '06.2017', 'type': TaxFormType.GOVERMENT,
     'help_link': 'https://www.irs.gov/pub/irs-pdf/iw8imy.pdf',
     'description': 'Certificate of Foreign Intermediary, Foreign Flow-Through Entity, or Certain U.S. Branches for United States Tax Withholding and Reporting',
     'details': """This form may serve to establish foreign status for purposes of sections 1441, 1442, and 1446.<br/>
                    <br/>More information: <br/> <a href='https://www.irs.gov/forms-pubs/about-form-w-8-imy'>https://www.irs.gov/forms-pubs/about-form-w-8-imy</a> 
                """},
]

TAX_FORMS_COMPANY_SPECIFIC = {
    'Patrizia AG': [
        {'form_id': 'Global-Entity-SC', 'file_name': 'demo-Entity-Self-Certification.pdf', 'version': 'v1',
         'type': TaxFormType.SELF_CERTIFICATION,
         'description': 'Entity Self-Certification',
         'details': """Entity Serlf Certification Details 
            """},
        {'form_id': 'Global-Individual-SC', 'file_name': 'demo-Individual-Self-Certification.pdf',
         'version': 'v1', 'type': TaxFormType.SELF_CERTIFICATION,
         'description': 'Individual Self-Certification',
         'details': """Indiividual Self certificacion details 
            """},
    ],
    'PGIM': [
        {'form_id': 'Global-Entity-SC', 'file_name': 'demo-Entity-Self-Certification.pdf', 'version': 'v1',
         'type': TaxFormType.SELF_CERTIFICATION,
         'description': 'Entity Self-Certification',
         'details': """Entity Serlf Certification Details 
            """},
        {'form_id': 'Global-Individual-SC', 'file_name': 'demo-Individual-Self-Certification.pdf',
         'version': 'v1', 'type': TaxFormType.SELF_CERTIFICATION,
         'description': 'Individual Self-Certification',
         'details': """Indiividual Self certificacion details 
            """},
    ],
    'Alternative Capital': [
        {'form_id': 'Global-Entity-SC', 'file_name': 'demo-Entity-Self-Certification.pdf', 'version': 'v1',
         'type': TaxFormType.SELF_CERTIFICATION,
         'description': 'Entity Self-Certification',
         'details': """Entity Serlf Certification Details 
            """},
        {'form_id': 'Global-Individual-SC', 'file_name': 'demo-Individual-Self-Certification.pdf',
         'version': 'v1', 'type': TaxFormType.SELF_CERTIFICATION,
         'description': 'Individual Self-Certification',
         'details': """Indiividual Self certificacion details 
            """},
    ],
    '*': [
        {'form_id': 'Global-Entity-SC', 'file_name': 'LaSalle-Global-Entity-Self-Certification-V1.pdf', 'version': 'v1',
         'type': TaxFormType.SELF_CERTIFICATION,
         'description': 'Entity Self-Certification',
         'details': """Entity Serlf Certification Details 
            """},
        {'form_id': 'Global-Individual-SC', 'file_name': 'LaSalle-Global-Individual-Self-Certification-V1.pdf',
         'version': 'v1', 'type': TaxFormType.SELF_CERTIFICATION,
         'description': 'Individual Self-Certification',
         'details': """Indiividual Self certificacion details 
            """},
    ]
}
