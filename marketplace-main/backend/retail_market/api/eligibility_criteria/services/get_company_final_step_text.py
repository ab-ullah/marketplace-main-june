from api.companies.models import Company

LASALLE_COMPANY_NAME = 'lasalle'


def get_payload(company: Company):
    if company.name.lower() == LASALLE_COMPANY_NAME:
        return {
            'need_review_text': 'Thank you! We will review your application shortly. You will receive an email when your application is ready for next steps.',
            'failure_text': 'Unfortunately, you are not eligible to invest. If you believe that you have received this message in error, please refer to the eligibility criteria on MyLaSalle. If you still have questions, please email EmployeeCoInvest@lasalle.com',
        }

    return {
        'need_review_text': 'Thank you!',
        'failure_text': 'Unfortunately, you are not eligible to invest',
    }
