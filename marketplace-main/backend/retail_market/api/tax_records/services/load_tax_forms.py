from api.companies.models import Company
from api.tax_records.data.tax_forms import TAX_FORMS, TAX_FORMS_COMPANY_SPECIFIC
from api.tax_records.models import TaxFormType, TaxForm


class CreateCompanyTaxFormsService:
    def __init__(self, company: Company):
        self.company = company

    def create(self):
        company = self.company
        for tax_form in TAX_FORMS:
            TaxForm.objects.update_or_create(
                form_id=tax_form['form_id'],
                company=company,
                defaults={
                    'version': tax_form['version'],
                    'file_name': tax_form['file_name'],
                    'type': tax_form['type'],
                    'description': tax_form['description'],
                    'details': tax_form['details'],
                    'help_link': tax_form.get('help_link'),
                }
            )
        specific_forms = TAX_FORMS_COMPANY_SPECIFIC.get(company.name)
        if not specific_forms:
            specific_forms = TAX_FORMS_COMPANY_SPECIFIC.get('*')
        for tax_form in specific_forms:
            TaxForm.objects.update_or_create(
                form_id=tax_form['form_id'],
                company=company,
                defaults={
                    'version': tax_form['version'],
                    'file_name': tax_form['file_name'],
                    'type': tax_form['type'],
                    'description': tax_form['description'],
                    'details': tax_form['details']
                }
            )
