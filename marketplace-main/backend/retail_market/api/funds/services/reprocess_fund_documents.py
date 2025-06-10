import csv
from io import StringIO

import botocore

from api.applications.utils import get_user_application
from api.documents.services.download_file import download_file_obj
from api.funds.models import Fund
from django.db.models import Q

class ProcessFundFilesRegions:
    def __init__(self, apps):
        self.email_to_id_mapping = {}
        self.apps = apps
        self.Country = None
        self.country_cache = {}

    def get_fund_ids(self):
        FundInviteDocument = self.apps.get_model('documents', 'FundInviteDocument')
        return FundInviteDocument.objects.values_list('fund_id', flat=True).order_by('-created_at')

    @staticmethod
    def read_csv(file_data):
        csv_file = StringIO(file_data.read().decode('utf-8'))
        return csv.DictReader(csv_file)

    def process_fund_invite_document(self, document, user_id_to_region_mapping, user_id_to_country_mapping):
        file_data = download_file_obj(document)
        RetailUser = self.apps.get_model('users', 'RetailUser')
        if document.extension.lower() == 'csv':
            data = self.read_csv(file_data=file_data)
            for row in data:
                email = row.get('Email Address')
                if not email:
                    continue

                email = email.lower()
                if email in self.email_to_id_mapping:
                    user_id = self.email_to_id_mapping[email]
                else:
                    try:
                        user = RetailUser.objects.get(email__iexact=email)
                        user_id = user.id
                        self.email_to_id_mapping[email] = user_id
                    except RetailUser.DoesNotExist:
                        continue

                user_id_to_region_mapping[user_id] = row['Region']
                user_id_to_country_mapping[user_id] = self.get_country_id(row['Office Location'])

    def get_country_id(self, country_code_or_name):
        if self.Country is None:
            self.Country = self.apps.get_model('geographics', 'Country')

        country_id = self.country_cache.get(country_code_or_name)
        if country_id is None:
            country = self.Country.objects.filter(
                Q(iso_code__iexact=country_code_or_name) | Q(name__iexact=country_code_or_name)).first()

            if country:
                self.country_cache[country.name] = country.id
                self.country_cache[country.iso_code] = country.id
                country_id = country.id

        return country_id

    def process_fund_id(self, fund_id: int):
        user_id_to_region_mapping = {}
        user_id_to_country_mapping = {}
        FundInviteDocument = self.apps.get_model('documents', 'FundInviteDocument')
        Application = self.apps.get_model('applications', 'Application')
        fund_invite_documents = FundInviteDocument.objects.filter(fund_id=fund_id).order_by('created_at')
        print(f"Processing Fund id: {fund_id}")
        for fund_invite_document in fund_invite_documents:
            self.process_fund_invite_document(
                document=fund_invite_document.document,
                user_id_to_region_mapping=user_id_to_region_mapping,
                user_id_to_country_mapping=user_id_to_country_mapping
            )

        for user_id, region in user_id_to_region_mapping.items():
            try:
                fund = Fund.objects.get(pk=fund_id)
                application = get_user_application({
                    'user_id': user_id,
                    'fund__external_id': fund.external_id
                })
            except Application.DoesNotExist:
                print("Could not find application for user {} in fund {}".format(user_id, fund_id))
                continue

            application.region = region
            country_id = user_id_to_country_mapping.get(user_id)
            application.defaults_from_fund_file['office_location'] = country_id
            application.save()


    def process(self):
        fund_ids = self.get_fund_ids()
        fund_ids = list(set(fund_ids))
        for fund_id in fund_ids:
            self.process_fund_id(fund_id=fund_id)
