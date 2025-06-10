import unittest
from unittest import TestCase

from api.dsls.filter_lang import get_filter_lang


class FilterLangTestCase(TestCase):

    def setUp(self) -> None:
        self.filter_lang = get_filter_lang()

    def test_example(self):
        input_expression = '''
            set a = '123'
            set b = 'abcd'
            if a == '123' { 
                set a = 'hello world!' 
            }
            if b {
                set b = "it's a mee"
                set us_holder_field1 = fields[a]
                require b
            }

            if d {
                set d = 'no value for me'
            }

            set e = fields[a]
            set f = "I'm a string!"
            require f
            set g = fields[c]
            require g
        '''

        context = dict()
        context['a'] = '2'
        context['b'] = '7'
        context['c'] = 8

        model = self.filter_lang.model_from_str(input_expression)
        model.run(context)
        new_value = context['f']
        del context['f']
        value = new_value['new_value'].as_dict()
        self.assertEquals(value['value'], "I'm a string!")
        self.assertEquals(value['type'], str)
        self.assertEquals(context, {'a': 'hello world!',
                                    'b': {'required': True, 'value': "it's a mee"}, 'c': 8,
                                    'us_holder_field1': {'copied': 'a', 'value': 'hello world!'},
                                    'e': {'copied': 'a', 'value': 'hello world!'},
                                    'g': {'copied': 'c', 'required': True, 'value': 8},
                                    }
                          )

    def test_more_real_case(self):
        context = {'tax-is_us_holder': True, 'ec-is_knowledgeable': False, 'ia-amount': '20,000,000.00', 'ia-leverage_ratio': '3', 'ia-final_amount': 0, 'ia-final_leverage_ratio': 0, 'ia-final_leverage': None, 'ia-leverage_amount': '60,000,000.00', 'ia-leverage_percent': '0', 'ia-employee_equity_percent': '', 'ia-total_investment': '80,000,000.00', 'application-created_at': '2023-04-06 16:24:51.061018+00:00', 'application-modified_at': '2023-04-06 16:24:51.061036+00:00', 'application-user': 'royrich@hotmail.com', 'application-company': 'Wilson, Mcintosh and Baker', 'application-fund': 'Cox, Lawrence and Richardson', 'application-tax_record': None, 'application-kyc_record': None, 'application-eligibility_response': 'EligibilityCriteriaResponse object (1)', 'application-investment_amount': None, 'application-payment_detail': None, 'application-eligibility_response_data_migration': False, 'application-share_class': None, 'application-vehicle': None, 'application-investor': None, 'application-is_application_updated': False, 'application-has_custom_equity': False, 'application-has_custom_leverage': False, 'application-has_custom_total_investment': False, 'application-update_comment': None, 'application-is_data_protection_policy_agreed': False, 'application-allocation_approval_email_sent': False, 'application-restricted_time_period': None, 'application-restricted_geographic_area': None, 'application-region': None, 'application-deleted': False, 'application-email': 'royrich@hotmail.com', 'application-fund_name': 'Cox, Lawrence and Richardson', 'application-share_class_is_a': False, 'application-share_class_is_b': False, 'application-share_class_is_c': False, 'application-share_class_is_d': False, 'fund-created_at': '2023-04-06 16:24:51.089514+00:00', 'fund-modified_at': '2023-04-06 16:24:51.089529+00:00', 'fund-fund': 'Cox, Lawrence and Richardson', 'fund-require_signature': True, 'fund-require_gp_signature': False, 'fund-gp_signer': 'AdminUser object (6)', 'fund-gp_signer_name': 'None None', 'fund-gp_signer_title': 'General Partner Signer', 'fund-gp_signer_date': '', 'fund-gp_signer_title2': '', 'applicant-signer_date': '04/06/2023', 'applicant-investor_signing_date': '04/06/2023'}
        input_expression = """
            set variable = fields[ec-is_knowledgeable]
            set is_us_holder = fields[tax-is_us_holder]
            if variable {
                set fund-gp_signer_another_field = "hello world!"
                set ia-amount = "123456789"
                require ia-amount
            }
            if is_us_holder {
                unset fields[ia-final_amount]
            }
        """

        filter_lang = get_filter_lang()
        model = filter_lang.model_from_str(input_expression)
        model.run(context)
        self.assertIn("fund-gp_signer_another_field", context)
        self.assertIn("required", context["ia-amount"])
        self.assertNotIn('some-field', context)
        self.assertNotIn('ia-final_amount', context)

    def test_other_unsets(self):
        context = {'tax-is_us_holder': True, 'ec-is_knowledgeable': False, 'ia-amount': '20,000,000.00',
                   'ia-leverage_ratio': '3', 'ia-final_amount': 0, 'ia-final_leverage_ratio': 0,
                   'ia-final_leverage': None, 'ia-leverage_amount': '60,000,000.00', 'ia-leverage_percent': '0',
                   'ia-employee_equity_percent': '', 'ia-total_investment': '80,000,000.00',
                   'application-created_at': '2023-04-06 16:24:51.061018+00:00',
                   'application-modified_at': '2023-04-06 16:24:51.061036+00:00',
                   'application-user': 'royrich@hotmail.com', 'application-company': 'Wilson, Mcintosh and Baker',
                   'application-fund': 'Cox, Lawrence and Richardson', 'application-tax_record': None,
                   'application-kyc_record': None, 'ec-csb-us-holder-2': True,
                   'application-eligibility_response': 'EligibilityCriteriaResponse object (1)',
                   'application-investment_amount': None, 'application-payment_detail': None,
                   'application-eligibility_response_data_migration': False, 'application-share_class': None,
                   'application-vehicle': None, 'application-investor': None,
                   'application-is_application_updated': False, 'application-has_custom_equity': False,
                   'application-has_custom_leverage': False, 'application-has_custom_total_investment': False,
                   'application-update_comment': None, 'application-is_data_protection_policy_agreed': False,
                   'application-allocation_approval_email_sent': False, 'application-restricted_time_period': None,
                   'application-restricted_geographic_area': None, 'application-region': None,
                   'application-deleted': False, 'application-email': 'royrich@hotmail.com',
                   'application-fund_name': 'Cox, Lawrence and Richardson', 'application-share_class_is_a': False,
                   'application-share_class_is_b': False, 'application-share_class_is_c': False,
                   'application-share_class_is_d': False, 'fund-created_at': '2023-04-06 16:24:51.089514+00:00',
                   'fund-modified_at': '2023-04-06 16:24:51.089529+00:00', 'fund-fund': 'Cox, Lawrence and Richardson',
                   'fund-require_signature': True, 'fund-require_gp_signature': False,
                   'fund-gp_signer': 'AdminUser object (6)', 'fund-gp_signer_name': 'None None',
                   'fund-gp_signer_title': 'General Partner Signer', 'fund-gp_signer_date': '',
                   'fund-gp_signer_title2': '', 'applicant-signer_date': '04/06/2023',
                   'aml-kyc-applicant_name': "mogolicardo",
                   'applicant-investor_signing_date': '04/06/2023'}

        input_expression = """
            if ec-csb-us-holder-2 == True {
              set aml-kyc-jurisdiction_of_organization = " "
              set aml-kyc-year_of_organization = " "
              set aml-kyc-is_applicant_owned_by_another_entity = " "
              set aml-kyc-is_not_applicant_owned_by_another_entity = " "
              set aml-kyc-is_direct_parent_owned_by_another_entity = " "
              set aml-kyc-is_not_direct_parent_owned_by_another_entity = " "
              set aml-kyc-is_applicant_organized_for_specific_purpose_of_investing = " "
              set aml-kyc-is_not_applicant_organized_for_specific_purpose_of_investing = " "
              set aml-kyc-net_worth = " "
              set ec-csb-us-accredited-investor-1 = " "
              set ec-csb-us-accredited-investor-2 = " "
              set ec-us-ai-3 = " "
              set ec-us-ai-4 = " "
              set ec-us-ai-license_type = " "
              set ec-us-ai-other_license = " "
              set ec-us-ai-5 = " "
              set ec-us-ai-6 = " "
              set ec-us-ai-7 = " "
              set ec-us-ai-8 = " "
              set ec-us-ai-9 = " "
              set ec-us-ai-10 = " "
              set ec-us-ai-11 = " "
              set ec-csb-us-accredited-investor-3 = " "
              set ec-csb-us-accredited-investor-4 = " "
              set ec-csb-us-accredited-investor-5 = " "
              set ec-csb-us-accredited-investor-6 = " "
              set ec-csb-us-accredited-investor-7 = " "
              set ec-csb-us-accredited-investor-8 = " "
              set ec-csb-us-accredited-investor-9 = " "
              set ec-csb-us-accredited-investor-10 = " "
              set ec-csb-us-accredited-investor-11 = " "
              set ec-us-qp-1 = " "
              set ec-us-qp-2 = " "
              set ec-us-qp-3 = " "
              set ec-us-qp-4 = " "
              set ec-us-qp-5 = " "
              set ec-us-qp-6 = " "
              set ec-ke-1 = " "
              set ec-csb-are-you-a-knowledgeable-employee-1 = " "
              set ec-csb-are-you-a-knowledgeable-employee-2 = " "
              set ec-csb-qualified-purchaser-1 = " "
              set ec-csb-qualified-purchaser-2 = " "
              set ec-csb-qualified-purchaser-3 = " "
              set ec-csb-qualified-purchaser-4 = " "
              set ec-csb-qualified-purchaser-5 = " "
              set ec-csb-qualified-purchaser-6 = " "
              set ec-csb-knowledgeable-employee-1 = " "
              set ec-csb-knowledgeable-employee-2 = " "
              copy us-holder-aml-kyc-applicant_name fields[aml-kyc-applicant_name]
              set us-holder-aml-kyc-applicant_name2 = fields[aml-kyc-applicant_name]
            }
        """

        filter_lang = get_filter_lang()
        model = filter_lang.model_from_str(input_expression)
        model.run(context)

        self.assertIn('us-holder-aml-kyc-applicant_name', context)
        self.assertIn('copied', context['us-holder-aml-kyc-applicant_name'])
        self.assertEquals(context['us-holder-aml-kyc-applicant_name']['copied'], 'aml-kyc-applicant_name')
        self.assertEquals(context['us-holder-aml-kyc-applicant_name2']['copied'], 'aml-kyc-applicant_name')

    @unittest.skip("Dictionary rules not implemented yet")
    def test_example_with_dict(self):
        input_expression = '''
            require my_dict
            
            set my_dict['key4'] = 'value1'
            set my_dict['key2']['subkey1'] = 'subvalue1'
            set my_dict['key2']['subkey2'] = 'subvalue2'
            
            if my_dict['key1'] == 'value1' {
                set my_dict['key2']['subkey1'] = 'new_subvalue1'
            }
            
            if my_dict['key2']['subkey2'] == 'subvalue2' {
                set my_dict['key2']['subkey2'] = 'new_subvalue2'
            }
            
            if my_dict == {'key1': 'value1', 'key2': {'subkey1': 'new_subvalue1', 'subkey2': 'new_subvalue2'}} {
                fields[my_field] = 'my_value'
            }
        '''

        context = dict()

        model = self.filter_lang.model_from_str(input_expression)
        model.run(context)

        self.assertEquals(context, {'key1': 'value1', 'key2': {'subkey1': 'new_subvalue1', 'subkey2': 'new_subvalue2'}})
