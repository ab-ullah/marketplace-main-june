# A data loader that creates models from CSV files
from slugify import slugify

import api.companies.models
import api.funds.models
import api.investors.models
import api.users.models
import csv
import os
from uuid import uuid4
from api import companies, funds, users, investors, notifications
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create Demo Data'

    # for mapping database ids to the CSV ids
    referenceTable = {}

    def add_arguments(self, parser):
        parser.add_argument('directory', type=str)

    def handle(self, *args, **options):
        payload = {'directory': options.get('directory')}
        self.create_demo_data(payload=payload)

    def create_demo_data(self, payload):
        self.create_companies(os.path.join(payload['directory'], "demo-data-import - companies_company.csv"))
        self.create_company_role(os.path.join(payload['directory'], "demo-data-import - companies_companyrole.csv"))
        self.create_funds(os.path.join(payload['directory'], "demo-data-import - funds_fund.csv"))
        self.create_users(os.path.join(payload['directory'], "demo-data-import - users_retailuser.csv"))
        self.create_company_user(os.path.join(payload['directory'], "demo-data-import - companies_companyuser.csv"))
        self.create_investor_orders(os.path.join(payload['directory'], "demo-data-import - investors_fundorder.csv"))
        self.create_investors(os.path.join(payload['directory'], "demo-data-import - investors_fundinvestor.csv"))
        self.create_notifications(os.path.join(payload['directory'], "demo-data-import - notifications.csv"))

    def create_companies(self, filename):
        references = {}
        self.referenceTable["companies"] = references
        with open(filename, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                company = {"name": row["name"], "is_enabled": row["is_enabled"] == "TRUE", "logo": row["logo"]}

                obj, created = companies.models.Company.objects.update_or_create(defaults=company, name=row["name"])
                references[row["ID"]] = obj

    def create_company_role(self, filename):
        references = {}
        self.referenceTable["companyrole"] = references
        with open(filename, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                model = {"name": row["name"], "leverage_ratio": row["leverage_ratio"],
                         "company": self.referenceTable["companies"][row["company_id"]]}

                obj, created = companies.models.CompanyRole.objects.update_or_create(defaults=model, name=row["name"],
                                                                                     company=model["company"])
                references[row["ID"]] = obj

    def create_company_user(self, filename):
        references = {}
        self.referenceTable["companyuser"] = references
        self.referenceTable["investors"] = {}
        with open(filename, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                model = {"company": self.referenceTable["companies"][row["company_id"]],
                         "role": self.referenceTable["companyrole"][row["role_id"]],
                         "user": self.referenceTable["users"][row["user_id"]]}

                obj, created = companies.models.CompanyUser.objects.update_or_create(defaults=model,
                                                                                     company=model["company"],
                                                                                     user=model["user"])
                references[row["ID"]] = obj
                # create the investor as well
                investor = {"company_user": obj, "leverage_used": 1.0}
                obj, created = investors.models.Investor.objects.update_or_create(defaults=investor, company_user=obj)
                self.referenceTable["investors"][row["user_id"]] = obj

    def create_funds(self, filename):
        references = {}
        self.referenceTable["funds"] = references
        with open(filename, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                fund = {"name": row["name"], "fund_type": row["fund_type"], "demand": self.str_to_float(row["demand"]),
                        "existing_investors": self.str_to_float(row["existing_investors"]),
                        "sold": self.str_to_float(row["sold"]), "unsold": self.str_to_float(row["unsold"]),
                        "county_code": row["country_code"],
                        "interest_rate": (self.str_to_float(row["interest_rate"]) / 100.0), "currency": row["currency"]}
                fund["slug"] = slugify(fund["name"])
                fund["company"] = self.referenceTable["companies"][row["company_id"]]

                obj, created = funds.models.Fund.objects.update_or_create(defaults=fund, name=row["name"],
                                                                          company=fund["company"])
                references[row["ID"]] = obj

    def create_users(self, filename):
        references = {}
        self.referenceTable["users"] = references
        with open(filename, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                model = {"email": row["email"], "username": row["email"], "first_name": row["first_name"],
                         "last_name": row["last_name"], "is_active": row["is_active"] == "TRUE", "username": row["username"]}

                obj, created = users.models.RetailUser.objects.update_or_create(defaults=model, username=row["username"])
                references[row["ID"]] = obj

    def create_investor_orders(self, filename):
        references = {}
        self.referenceTable["fundorder"] = references
        with open(filename, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                model = {"requested_allocation": self.str_to_float(row["requested_allocation"]),
                         "requested_leverage": self.str_to_float(row["requested_leverage"]),
                         "approved_allocation": self.str_to_float(row["requested_allocation"]), "status": row["status"],
                         "fund": self.referenceTable["funds"][row["fund_id"]],
                         "investor": self.referenceTable["investors"][row["investor_id"]]}

                obj, created = investors.models.FundOrder.objects.update_or_create(defaults=model, fund=model["fund"],
                                                                                   investor=model["investor"])
                references[row["ID"]] = obj

    def create_investors(self, filename):
        references = {}
        self.referenceTable["investor"] = references
        with open(filename, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                model = {"purchase_price": self.str_to_float(row["purchase_price"]),
                         "total_distributions": self.str_to_float(row["total_distributions"]),
                         "pending_distributions": self.str_to_float(row["pending_distributions"]),
                         "fund": self.referenceTable["funds"][row["fund_id"]],
                         "investor": self.referenceTable["investors"][row["investor_id"]],
                         "order": self.referenceTable["fundorder"][row["order_id"]],
                         "leverage_used": self.str_to_float(row["leverage_used"]),
                         "current_net_equity": self.str_to_float(row["current_net_equity"]),
                         "leveraged_irr": self.str_to_float(row["leveraged_irr"]) / 100.0,
                         "loan_balance_with_unpaid_interest": self.str_to_float(
                             row["loan_balance_with_unpaid_interest"]),
                         "nav_share": self.str_to_float(row["nav_share"]) / 100.0,
                         "remaining_equity": self.str_to_float(row["remaining_equity"]),
                         "un_leveraged_irr": self.str_to_float(row["un_leveraged_irr"]) / 100.0,
                         "unrealized_gain": self.str_to_float(row["unrealized_gain"]),
                         "commitment_to_date": self.str_to_float(row["commitment_to_date"]),
                         "current_interest_rate": self.str_to_float(row["current_interest_rate"]) / 100.0,
                         "current_leverage_ratio": self.str_to_float(row["current_leverage_ratio"]) / 100.0,
                         "equity_called": self.str_to_float(row["equity_called"]),
                         "equity_commitment": self.str_to_float(row["equity_commitment"]),
                         "fund_nav_date": row["fund_nav_date"],
                         "fund_ownership_percent": self.str_to_float(row["fund_ownership_percent"]) / 100.0,
                         "initial_leverage_ratio": self.str_to_float(row["initial_leverage_ratio"]) / 100.0,
                         "interest_accrued": self.str_to_float(row["interest_accrued"]),
                         "interest_paid": self.str_to_float(row["interest_paid"]),
                         "percent_of_account": self.str_to_float(row["percent_of_account"]) / 100.0,
                         "uncalled_amount": self.str_to_float(row["uncalled_amount"])}

                obj, created = investors.models.FundInvestor.objects.update_or_create(model, order=model["order"])
                references[row["ID"]] = obj

    def create_notifications(self, filename):
        references = {}
        self.referenceTable["notifications"] = references
        with open(filename, newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                model = {"document_date": row["document_date"],
                         "notification_type": row["notification_type"],
                         "fund": self.referenceTable["funds"][row["fund_id"]],
                         "user": self.referenceTable["companyuser"][row["user_id"]],
                         "company":self.referenceTable["companies"][row["company_id"]],
                         "uuid": uuid4()
                         }

                if row["due_date"] != "":
                    model["due_date"] = row["due_date"]

                obj, created = notifications.models.UserNotification.objects.update_or_create(model, uuid=model["uuid"])
                references[row["ID"]] = obj


    @staticmethod
    def str_to_float(value):
        return float(value.replace("$", "").replace(",", "").replace("%", ""))
