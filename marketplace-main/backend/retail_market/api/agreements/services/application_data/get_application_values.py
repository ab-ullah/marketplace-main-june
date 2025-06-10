from django.core.exceptions import ObjectDoesNotExist

from api.agreements.services.application_data.aml_kyc_details import AmlKycOptions
from api.agreements.services.application_data.applicant_details import ApplicantOptions
from api.agreements.services.application_data.fund_document_details import FundDocumentsDetails, CompanyDocumentDetails
from api.agreements.services.application_data.application_details import ApplicationOptions
from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, SIGNATURE_TYPE, BOOLEAN_FIELD_TYPE
from api.agreements.services.application_data.eligibility_criteria_details import EligibilityCriteriaOptions
from api.agreements.services.application_data.investment_amount_details import InvestmentAmountOptions
from api.agreements.services.application_data.payment_details import PaymentDetailOptions
from api.agreements.services.application_data.tax_details import TaxDetailOptions
from api.agreements.services.application_data.transfer_details import TransferDetailOption
from api.applications.models import Application
from api.companies.models import CompanyDocument
from api.dsls.filter_lang import get_filter_lang


class GetApplicationValuesService:
    def __init__(self, application: Application, document):
        self.application = application
        self.document = document

    def get(self):
        application = self.application
        eligibility_criteria_values = EligibilityCriteriaOptions().get_values(
            instance=application.eligibility_response,
            fund=application.fund
        )
        aml_kyc_values = AmlKycOptions().get_values(instance=application.kyc_record)
        investment_amount = None
        investment_amount_values = []
        if application.eligibility_response:
            investment_amount = application.eligibility_response.investment_amount
            investment_amount_values = InvestmentAmountOptions(application=application).get_values(
                instance=application.eligibility_response.investment_amount
            )

        if isinstance(self.document, CompanyDocument):
            fund_values = CompanyDocumentDetails().get_values(
                instance=self.document,
                investment_amount=investment_amount
            )
        else:
            fund_values = FundDocumentsDetails().get_values(
                instance=self.document,
                investment_amount=investment_amount
            )

        transfer_values = []
        if application.transfer:
            transfer_values = TransferDetailOption().get_values(instance=application.transfer)

        banking_detail_values = PaymentDetailOptions().get_values(instance=application.payment_detail)
        tax_detail_values = TaxDetailOptions().get_values(instance=application.tax_record)
        application_values = ApplicationOptions().get_values(instance=application)
        applicant_values = ApplicantOptions().get_values(instance=application)

        preprocess = {
            'banking_details': banking_detail_values,
            'tax_details': tax_detail_values,
            'aml_kyc_details': aml_kyc_values,
            'eligibility_criteria_details': eligibility_criteria_values,
            'investment_amount_details': investment_amount_values,
            'application_values': application_values,
            'fund_values': fund_values,
            'applicant_values': applicant_values,
            'transfer_values': transfer_values,
        }

        return preprocess

    def get_filtered_values_as_dict(self):
        preprocess = {k: v['value'] for k, v in self.get_as_dict().items() if 'value' in v}
        fund = self.application.fund
        try:
            filter_interpreter = get_filter_lang()
            model = filter_interpreter.model_from_str(fund.document_filter.code)

            copy = preprocess.copy()
            model.run(copy)
            return copy
        except ObjectDoesNotExist:
            return preprocess

    def get_as_dict(self):
        values = self.get()
        preprocess = dict()
        for _, v in values.items():
            if v:
                dicted = {field['id']: field for field in v if 'value' in field}
                preprocess = {**preprocess, **dicted}
        return preprocess

    def get_type(self, field_type):
        if field_type == str:
            return TEXT_FIELD_TYPE
        elif field_type == bool:
            return BOOLEAN_FIELD_TYPE

        return TEXT_FIELD_TYPE

    def get_flat(self):
        fields_values = self.get()
        filtered_values = self.get_filtered_values_as_dict()
        values = []
        values_as_dict = self.get_as_dict()
        for details in [v for v in fields_values.values() if v is not None]:
            for detail in details:
                if detail['id'] in filtered_values:
                    value = filtered_values[detail['id']]
                    try:
                        detail['value'] = value.get('value')
                        detail['required'] = value.get('required')
                    except TypeError:
                        detail['value'] = value
                    except AttributeError:
                        detail['value'] = value
            values.extend(details)

        for field, filtered_value in filtered_values.items():
            try:
                value = None
                if 'copied' in filtered_value:
                    copied_id = filtered_value['copied']
                    value = values_as_dict[copied_id].copy()
                    if not value.get('value'):
                        value['value'] = True
                    value['id'] = field
                if 'new_value' in filtered_value:
                    value = filtered_value['new_value'].as_dict()
                    value['id'] = field
                    value['type'] = self.get_type(value['type'])
                if value:
                    value['required'] = filtered_value.get('required', False)
                    values.append(value)
            except TypeError:
                continue

        text_fields = []
        checkbox_fields = []
        signature_fields = []

        for form_field in values:
            if not form_field.get('value'):
                continue
            if form_field['type'] == TEXT_FIELD_TYPE:
                text_fields.append(form_field)
            elif form_field['type'] == SIGNATURE_TYPE:
                signature_fields.append(form_field)
            else:
                checkbox_fields.append(form_field)
        return {
            'text_tabs': text_fields,
            'checkbox_tabs': checkbox_fields,
            'signature_tabs': signature_fields,
        }
