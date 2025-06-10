from django.test import TestCase

from api.activities.utils.investment_code_parser import parse_activity_investment_code
from api.funds.utils.investment_code_parser import parse_fund_investment_code


class InvestmentCodeParserTestCase(TestCase):

    def test_parse_activity_investment_code(self):
        raw_code = '1234a5678'
        parsed_info = parse_activity_investment_code(raw_code=raw_code)
        self.assertEqual(parsed_info['investment_code'], '1234a')
        self.assertEqual(parsed_info['share_class'], '56')
        self.assertEqual(parsed_info['leverage_ratio'], '78')

        raw_code = '1234b567'
        parsed_info = parse_activity_investment_code(raw_code=raw_code)
        self.assertEqual(parsed_info['investment_code'], '1234b')
        self.assertEqual(parsed_info['share_class'], '5')
        self.assertEqual(parsed_info['leverage_ratio'], '67')

        raw_code = '1234c56'
        parsed_info = parse_activity_investment_code(raw_code=raw_code)
        self.assertEqual(parsed_info['investment_code'], '1234c')
        self.assertEqual(parsed_info['share_class'], '56')
        self.assertEqual(parsed_info['leverage_ratio'], '')

        raw_code = '1234d5'
        parsed_info = parse_activity_investment_code(raw_code=raw_code)
        self.assertEqual(parsed_info['investment_code'], '1234d')
        self.assertEqual(parsed_info['share_class'], '5')
        self.assertEqual(parsed_info['leverage_ratio'], '')

        raw_code = '1234a'
        parsed_info = parse_activity_investment_code(raw_code=raw_code)
        self.assertEqual(parsed_info['investment_code'], '1234a')
        self.assertEqual(parsed_info['share_class'], '')
        self.assertEqual(parsed_info['leverage_ratio'], '')

        raw_code = '123'
        parsed_info = parse_activity_investment_code(raw_code=raw_code)
        self.assertEqual(parsed_info['investment_code'], '123')
        self.assertEqual(parsed_info['share_class'], '')
        self.assertEqual(parsed_info['leverage_ratio'], '')

    def test_parse_fund_investment_code(self):
        raw_code = '1234a56'
        parsed_info = parse_fund_investment_code(raw_code=raw_code)
        self.assertEqual(parsed_info['investment_code'], '1234a')
        self.assertEqual(parsed_info['vehicle_code'], '56')

        raw_code = '1234a'
        parsed_info = parse_fund_investment_code(raw_code=raw_code)
        self.assertEqual(parsed_info['investment_code'], '1234a')
        self.assertEqual(parsed_info['vehicle_code'], '')

        raw_code = '1234d567'
        parsed_info = parse_fund_investment_code(raw_code=raw_code)
        self.assertEqual(parsed_info['investment_code'], '1234d')
        self.assertEqual(parsed_info['vehicle_code'], '567')
