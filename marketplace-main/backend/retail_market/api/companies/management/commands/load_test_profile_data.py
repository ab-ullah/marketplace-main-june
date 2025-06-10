import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company, CompanyProfile, CompanyFAQ
from api.funds.models import Fund, FundProfile

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Seed Co-Investment Program company data'

    def handle(self, *args, **options):
        for company in Company.objects.iterator():
            CompanyProfile.objects.update_or_create(
                company=company,
                defaults={
                    'program_name': 'Employee Co-Investment Program',
                    'mission_statement': 'Providing you with investment opportunities today. For tomorrow.',
                    'opportunities_description': 'LaSalle is offering employees the opportunity to invest in a variety of open-end funds, closed-end funds, and certain separate accounts and other vehicles as the opportunities arise. The following funds are planned to be available for investment soon.',
                    'contact_email': 'EmployeeCoInvest@lasalle.com',
                    'stats': [
                        {'label': 'Real Estate Investment Experience', 'value': '40yrs'},
                        {'label': 'Countries', 'value': '15'},
                        {'label': 'Assets Under Management', 'value': '$73B'},
                    ]
                }
            )

            CompanyFAQ.objects.create(
                company=company,
                display_on_top=True,
                question='What is our Employee Co-Investment Program?',
                answer="""At LaSalle, we are committed to investing in our people and providing employees direct ways to benefit from LaSalle's growth and success. \n
                        Our Employee Co-Investment Program offers eligible employees the chance to invest with financing alongside our clients, creating an exciting opportunity for employees to take advantage of our dynamic products and offerings. Additionally, the Program highlights our alignment of interest with clients, and demonstrates conviction in our investment process that has successfully guided the firm for more than 40 years. \n
                        This site is intended to provide you with a comprehensive overview of the program, current and upcoming investment opportunities, as well as answer any questions you may have about the program."""
            )

        for fund in Fund.objects.iterator():
            fund.minimum_investment = 10000
            fund.save()

            eligibility_criteria = [
                {'country': 'USA', 'eligibility': 'Knowledgeable Employee or Accredited Investor'},
                {'country': 'Singapore', 'eligibility': 'Qualifying Person'},
            ]
            FundProfile.objects.update_or_create(
                fund=fund,
                defaults={
                    'investment_region': 'United States',
                    'target_size': 'USD $750 million in equity commitments',
                    'target_investment_markets': 'Originate floating rate first mortgage loans (sized $5-$50 million) secured by value-add commercial real estate in growth markets across the U.S.',
                    'target_return': '7-9% Net IRR',
                    'employee_investment_period': 'Q4 2021',
                    'allocation_request_dates': 'Sept 15- Sept 30',
                    'intro': 'LaSalle Mortgage Real Estate Capital Fund V is the next in a long-standing first mortgage debt series fund targeting U.S. value-add commercial real estate.',
                    'eligibility_criteria': eligibility_criteria,
                    'description': """The Fund targets core plus returns by providing floating rate bridge financing to value-add commercial real estate assets in growth markets across the U.S. The team underwrites each transaction bottom-up through an equity owners’ lens making sure that all interests are aligned and there is a clear exit strategy. \n
                        To date, the LMREC fund's cycle-tested management team and vertically integrated platform has successfully closed over US$4.5 billion in transactions across all primary commercial real estate property types."""
                }
            )
