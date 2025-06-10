def get_company_name_from_email(email: str):
    domain = email.split('@')[-1]
    company_name = domain.rsplit('.', 1)[0]
    return company_name
