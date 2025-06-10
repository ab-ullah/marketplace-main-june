from api.eligibility_criteria.services.eval_eligibility_expression import EligibilityParser
from rest_framework.test import APITestCase

class EligibilityCriteriaCustomLogicAPITestCase(APITestCase):
    def setUp(self) -> None:
        pass

    def test_custom_logic(self):
        test_cases = [
            {
                # 0
                'expression': 'A',
                'values': {
                    'A': True,
                },
                'expected_value': True
            },
            {
                # 1
                'expression': 'A',
                'values': {
                    'A': False,
                },
                'expected_value': False
            },
            {
                # 2
                'expression': 'A and (B or C)',
                'values': {
                    'A': True,
                    'B': True,
                    'C': False
                },
                'expected_value': True
            },
            {
                # 3
                'expression': 'A and (B or C)',
                'values': {
                    'A': True,
                    'B': False,
                    'C': True
                },
                'expected_value': True
            },
            {
                # 4
                'expression': 'A and (B or C)',
                'values': {
                    'A': False,
                    'B': True,
                    'C': True
                },
                'expected_value': False
            },
            {
                # 5
                'expression': 'A and (B or C)',
                'values': {
                    'A': True,
                    'B': False,
                    'C': False
                },
                'expected_value': False
            },
            {
                # 6
                'expression': 'A and B and C',
                'values': {
                    'A': False,
                    'B': False,
                    'C': False
                },
                'expected_value': False
            },
            {
                # 7
                'expression': 'A and B and C',
                'values': {
                    'A': True,
                    'B': False,
                    'C': False
                },
                'expected_value': False
            },
            {
                # 8
                'expression': 'A and B and C',
                'values': {
                    'A': True,
                    'B': True,
                    'C': False
                },
                'expected_value': False
            },
            {
                # 9
                'expression': 'A and B and C',
                'values': {
                    'A': True,
                    'B': True,
                    'C': True
                },
                'expected_value': True
            },
            {
                # 10
                'expression': 'A or B or C',
                'values': {
                    'A': True,
                    'B': True,
                    'C': True
                },
                'expected_value': True
            },
            {
                # 11
                'expression': 'A or B or C',
                'values': {
                    'A': False,
                    'B': True,
                    'C': True
                },
                'expected_value': True
            },
            {
                # 12
                'expression': 'A or B or C',
                'values': {
                    'A': False,
                    'B': False,
                    'C': True
                },
                'expected_value': True
            },
            {
                # 13
                'expression': 'A or B or C',
                'values': {
                    'A': False,
                    'B': False,
                    'C': False
                },
                'expected_value': False
            },
            {
                # 14
                'expression': 'A and ((B and C) or (D and E)) and F',
                'values': {
                    'A': True,
                    'B': False,
                    'C': False,
                    'D': True,
                    'E': True,
                    'F': True
                },
                'expected_value': True
            },
            {
                # 15
                'expression': 'A and ((B and C) or (D and E)) and F',
                'values': {
                    'A': True,
                    'B': True,
                    'C': True,
                    'D': False,
                    'E': True,
                    'F': True
                },
                'expected_value': True
            },
            {
                # 16
                'expression': 'A and ((B and C) or (D and E)) and F',
                'values': {
                    'A': False,
                    'B': True,
                    'C': True,
                    'D': True,
                    'E': True,
                    'F': True
                },
                'expected_value': False
            },
            {
                # 17
                'expression': 'A and ((B or C) and (D or E)) and F',
                'values': {
                    'A': True,
                    'B': True,
                    'C': False,
                    'D': True,
                    'E': False,
                    'F': True
                },
                'expected_value': True
            },
            {
                # 18
                'expression': 'G and ((A and (B or C)) or ((D or E) and F))',
                'values': {
                    'A': True,
                    'B': True,
                    'C': False,
                    'D': True,
                    'E': False,
                    'F': True,
                    'G': True,
                },
                'expected_value': True
            },

            {
                # 19
                'expression': 'G and ((A and (B or C)) or ((D or E) and F))',
                'values': {
                    'G': True,
                    'A': False,
                    'B': True,
                    'C': False,
                    'D': True,
                    'E': False,
                    'F': False,
                },
                'expected_value': False
            },
            {
                # 20
                'expression': '((A or B) or C) and (D and (E or F))',
                'values': {
                    'A': False,
                    'B': False,
                    'C': True,
                    'D': True,
                    'E': False,
                    'F': True,
                },
                'expected_value': True
            },
            {
                # 21
                'expression': 'us_holder and (ai and (ke or qp)) and kiid',
                'values': {
                    'us_holder': True,
                    'kiid': True
                },
                'expected_value': True,
                'skip_unvisted': True,
            },
            {
                # 22
                'expression': 'us_holder and (ai and (ke or qp)) and kiid',
                'values': {
                    'us_holder': True,
                    'ai': True,
                    'ke': True,
                    'qp': False,
                    'kiid': True
                },
                'expected_value': True,
                'skip_unvisted': True,
            },
            {
                # 23
                'expression': 'us_holder and (ai and (ke or qp)) and kiid',
                'values': {
                    'us_holder': True,
                    'ai': False,
                    'ke': True,
                    'qp': False,
                    'kiid': True
                },
                'expected_value': False,
                'skip_unvisted': True,
            },
            {
                # 24
                'expression': '(A and B) or (C and D and E and F)',
                'values': {
                    'A': False,
                    'B': False,
                    'C': True,
                    'D': True,
                    'E': True,
                    'F': False,
                },
                'expected_value': False
            },
        ]

        case = 0
        for test_case in test_cases:
            values = test_case['values']
            expression = test_case['expression']
            skip_unvisited = test_case.get('skip_unvisted', False)
            parser = EligibilityParser(values, skip_unvisited=skip_unvisited)
            expected_value = test_case['expected_value']
            actual_value = parser.evaluate(expression)

            self.assertEqual(expected_value, actual_value,
                             "{} {} expected {} got {}".format(case, expression, expected_value, actual_value))
            case = case + 1