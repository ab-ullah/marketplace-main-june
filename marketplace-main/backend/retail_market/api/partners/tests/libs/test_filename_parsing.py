from unittest import TestCase

from api.partners.libs.file_name_parsing import parse_file_name


class FilenameParsingTestCase(TestCase):

    def test_file_name_parsing(self):
        file_name = 'garbage'
        parsed_file_name = parse_file_name(file_name)
        self.assertIsNone(parsed_file_name)

        file_name = "0eecoinvest_test_2cd4feb0-f611-48be-9996-a8791d319a7d_df29da54-5f7f-4d2f-8d36-8a6dd9ba080c_distributions_1_2022-07-10_2022-08-01.pdf"
        parsed_file_name = parse_file_name(file_name)
        self.assertEqual(parsed_file_name['fund_id'], '2cd4feb0-f611-48be-9996-a8791d319a7d')
        self.assertEqual(parsed_file_name['investor_vehicle_id'], 'df29da54-5f7f-4d2f-8d36-8a6dd9ba080c')
        self.assertEqual(parsed_file_name['file_type'], 'distributions')
        self.assertEqual(parsed_file_name['file_date'], '2022-07-10')
        self.assertEqual(parsed_file_name['due_date'], None)
        self.assertEqual(parsed_file_name['expected_pay_date'], '2022-08-01')



        file_name = "0eecoinvest_test_2cd4feb0-f611-48be-9996-a8791d319a7d_df29da54-5f7f-4d2f-8d36-8a6dd9ba080c_capital-call_1_2022-07-10_2022-08-10.pdf"
        parsed_file_name = parse_file_name(file_name)
        self.assertEqual(parsed_file_name['fund_id'], '2cd4feb0-f611-48be-9996-a8791d319a7d')
        self.assertEqual(parsed_file_name['investor_vehicle_id'], 'df29da54-5f7f-4d2f-8d36-8a6dd9ba080c')
        self.assertEqual(parsed_file_name['file_type'], 'capital-call')
        self.assertEqual(parsed_file_name['file_date'], '2022-07-10')
        self.assertEqual(parsed_file_name['due_date'], '2022-08-10')


        file_name = 'this_test_investment1_investor2_capital-calls_1_22/33/2019_12/01/2020'
        parsed_file_name = parse_file_name(file_name)
        self.assertEqual(parsed_file_name['fund_id'], 'investment1')
        self.assertEqual(parsed_file_name['investor_vehicle_id'], 'investor2')
        self.assertEqual(parsed_file_name['file_type'], 'capital-calls')
        self.assertEqual(parsed_file_name['file_date'], '22/33/2019')
        self.assertEqual(parsed_file_name['due_date'], '12/01/2020')

        # Production environments will not have the env segment set
        file_name = 'this_investment1_investor2_capital-calls_1_22/33/2019_22/01/2019'
        parsed_file_name = parse_file_name(file_name)
        self.assertEqual(parsed_file_name['fund_id'], 'investment1')
        self.assertEqual(parsed_file_name['investor_vehicle_id'], 'investor2')
        self.assertEqual(parsed_file_name['file_type'], 'capital-calls')
        self.assertEqual(parsed_file_name['file_date'], '22/33/2019')
        self.assertEqual(parsed_file_name['due_date'], '22/01/2019')


        file_name = 'investment1_investor2_capital-calls_'
        parsed_file_name = parse_file_name(file_name)
        self.assertIsNone(parsed_file_name)

        file_name = 'investment1_investor2'
        parsed_file_name = parse_file_name(file_name)
        self.assertIsNone(parsed_file_name)

        file_name = '0xabcd_TEST_2cd4feb0-f611-48be-9996-a8791d319a7d_3b331112-de92-4386-b521-b078b1aae96b_capital-calls_1_2021-11-07_2021-12-03.pdf'
        parsed_file_name = parse_file_name(file_name)
        self.assertEqual(parsed_file_name['fund_id'], "2cd4feb0-f611-48be-9996-a8791d319a7d")
        self.assertEqual(parsed_file_name['investor_vehicle_id'], '3b331112-de92-4386-b521-b078b1aae96b')
        self.assertEqual(parsed_file_name['file_type'], 'capital-calls')
        self.assertEqual(parsed_file_name['file_date'], '2021-11-07')
        self.assertEqual(parsed_file_name['due_date'], '2021-12-03')
        self.assertEqual(parsed_file_name['sequence_number'], '1')

        file_name = '0xabcd_TEST_2cd4feb0-f611-48be-9996-a8791d319a7d_3b331112-de92-4386-b521-b078b1aae96b_capital-calls_1_2021-11-07_2022-01-01.'
        parsed_file_name = parse_file_name(file_name)
        self.assertEqual(parsed_file_name['fund_id'], "2cd4feb0-f611-48be-9996-a8791d319a7d")
        self.assertEqual(parsed_file_name['investor_vehicle_id'], '3b331112-de92-4386-b521-b078b1aae96b')
        self.assertEqual(parsed_file_name['file_type'], 'capital-calls')
        self.assertEqual(parsed_file_name['file_date'], '2021-11-07')
        self.assertEqual(parsed_file_name['due_date'], '2022-01-01')

        file_name = '0xabcd_TEST_2cd4feb0-f611-48be-9996-a8791d319a7d_3b331112-de92-4386-b521-b078b1aae96b_Capital-Calls_1_2021-11-07_2022-01-01.'
        parsed_file_name = parse_file_name(file_name)
        self.assertEqual(parsed_file_name['fund_id'], "2cd4feb0-f611-48be-9996-a8791d319a7d")
        self.assertEqual(parsed_file_name['investor_vehicle_id'], '3b331112-de92-4386-b521-b078b1aae96b')
        self.assertEqual(parsed_file_name['file_type'], 'capital-calls')
        self.assertEqual(parsed_file_name['file_date'], '2021-11-07')
        self.assertEqual(parsed_file_name['due_date'], '2022-01-01')

        file_name = '0xabcd_TEST_2cd4feb0-f611-48be-9996-a8791d319a7d_3b331112-de92-4386-b521-b078b1aae96b_capital-calls_1_2021-11-07_2022-01-01_extra_fields'
        parsed_file_name = parse_file_name(file_name)
        self.assertIsNone(parsed_file_name)