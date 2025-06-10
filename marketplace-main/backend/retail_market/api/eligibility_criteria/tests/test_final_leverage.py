from api.eligibility_criteria.models import InvestmentAmount
from core.base_tests import BaseTestCase


class InvestmentAmountFinalLeverageTestCase(BaseTestCase):

    def setUp(self) -> None:
        self.create_company()

    def test_final_leverage_ratio_calculation(self):
        investment_amount = InvestmentAmount.objects.create(
            amount=10
        )
        self.assertFalse(investment_amount.has_final_leverage_set())
        self.assertEqual(investment_amount.get_final_leverage_ratio(), 0)
        self.assertEqual(investment_amount.get_total_leverage(), 0)
        self.assertEqual(investment_amount.get_total_investment(), 10)


        investment_amount.leverage_ratio = 2
        investment_amount.save()
        self.assertFalse(investment_amount.has_final_leverage_set())
        self.assertEqual(investment_amount.get_final_leverage_ratio(), 2)
        self.assertEqual(investment_amount.get_total_leverage(), 20)
        self.assertEqual(investment_amount.get_total_investment(), 30)

        investment_amount.final_leverage_ratio = 0
        investment_amount.save()
        self.assertTrue(investment_amount.has_final_leverage_set())
        self.assertEqual(investment_amount.get_final_leverage_ratio(), 0)
        self.assertEqual(investment_amount.get_total_leverage(), 0)
        self.assertEqual(investment_amount.get_total_investment(), 10)

        investment_amount.final_leverage_ratio = 3
        investment_amount.save()
        self.assertTrue(investment_amount.has_final_leverage_set())
        self.assertEqual(investment_amount.get_final_leverage_ratio(), 3)
        self.assertEqual(investment_amount.get_total_leverage(), 30)
        self.assertEqual(investment_amount.get_total_investment(), 40)

    def test_final_leverage_description(self):
        investment_amount = InvestmentAmount.objects.create(
            amount=10,
            leverage_option_description='Test Description'
        )
        self.assertFalse(investment_amount.has_final_leverage_set())
        self.assertEqual(investment_amount.get_final_leverage_ratio_description(), 'Test Description')


        investment_amount.final_leverage_ratio = 4
        investment_amount.final_leverage_option_description = 'Final Description'
        investment_amount.save()

        self.assertEqual(investment_amount.get_final_leverage_ratio_description(), 'Final Description')
