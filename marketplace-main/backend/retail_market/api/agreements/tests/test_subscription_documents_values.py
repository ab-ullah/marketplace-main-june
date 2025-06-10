from api.agreements.services.application_data.aml_kyc_details import AmlKycOptions
from api.agreements.services.application_data.application_details import ApplicationOptions
from api.agreements.services.application_data.investment_amount_details import InvestmentAmountOptions
from api.eligibility_criteria.tests.factories import InvestmentAmountFactory, ApplicationFactory
from api.funds.models import DocumentFilter
from api.kyc_records.tests.factories import KYCRecordFactory
from api.partners.tests.factories import CompanyFundVehicleFactory, FundShareClassFactory
from core.base_tests import BaseTestCase

from api.admin_users.tests.factories import AdminUserFactory
from api.documents.tests.factories import DocumentFactory
from api.documents.models import FundDocument
from api.agreements.services.application_data.get_application_values import GetApplicationValuesService


class TestSubscriptionDocumentValues(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.create_card_workflow(company=self.company)
        self.setup_fund(company=self.company)
        self.client.force_authenticate(self.user)
        self.create_currency()
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)

    def setup_application(self):
        application = self.create_application(
            fund=self.fund,
            company_user=self.company_user,
        )
        return application

    def create_fund_document(self):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        fund_document = FundDocument.objects.create(
            document=document,
            fund=self.fund,
            require_signature=True,
            gp_signer=self.admin_user
        )
        return fund_document

    def get_field(self, fields, field_id):
        for field in fields:
            if field['id'] == field_id:
                return field

        return {}

    def test_subscription_document_values(self):
        application = self.setup_application()
        fund_document = self.create_fund_document()
        subscription_document_values = GetApplicationValuesService(application=application,
                                                                   document=fund_document).get()

        subscription_document_flattened_values = GetApplicationValuesService(application=application,
                                                                   document=fund_document).get_flat()

        flattened_fields = subscription_document_flattened_values['text_tabs']
        title_field = self.get_field(flattened_fields, 'fund-gp_signer_title')
        name_field = self.get_field(flattened_fields, 'fund-gp_signer_name')
        self.assertEqual(title_field['value'], self.admin_user.title)
        self.assertEqual(name_field['value'],
                         f'{self.admin_user.user.first_name} {self.admin_user.user.last_name}'.strip())

        fields = subscription_document_values['fund_values']
        title_field = self.get_field(fields, 'fund-gp_signer_title')
        name_field = self.get_field(fields, 'fund-gp_signer_name')
        self.assertEqual(title_field['value'], self.admin_user.title)
        self.assertEqual(name_field['value'],
                         f'{self.admin_user.user.first_name} {self.admin_user.user.last_name}'.strip())

    def test_subscription_document_filtered_values(self):
        application = self.setup_application()
        code = """
            set variable = fields[ec-is_knowledgeable]
            if variable {
                set fund-gp_signer_another_field = "hello world!"
                set ia-amount = "123456789"
            }
        """
        fund = application.fund
        fund.document_filter = DocumentFilter.objects.create(code=code, fund=fund)
        fund.save()
        fund_document = self.create_fund_document()
        service = GetApplicationValuesService(application=application, document=fund_document)
        fully_flat = service.get_filtered_values_as_dict()
        title_field = fully_flat['fund-gp_signer_title']
        name_field = fully_flat['fund-gp_signer_name']
        self.assertIn('fund-gp_signer_another_field', fully_flat)
        my_new_field = fully_flat['fund-gp_signer_another_field']
        investment_amount = fully_flat['ia-amount']
        self.assertEqual(title_field, self.admin_user.title)
        self.assertEqual(name_field, f'{self.admin_user.user.first_name} {self.admin_user.user.last_name}'.strip())
        self.assertEqual(my_new_field['new_value'].value, 'hello world!')
        self.assertEqual(investment_amount, "123456789")

        flattened = service.get_flat()
        flattened_fields = flattened['text_tabs']
        ia_amount = self.get_field(flattened_fields, 'ia-amount')
        self.assertEqual(ia_amount['value'], investment_amount)

    def test_currency_values(self):
        kyc_record = KYCRecordFactory(net_worth=100000000)
        aml_kyc_values = AmlKycOptions().get_values(instance=kyc_record)

        for kyc_value in aml_kyc_values:
            if kyc_value['id'] == 'aml-kyc-net_worth':
                self.assertEqual(kyc_value['value'], '100,000,000.00')

        kyc_record = KYCRecordFactory(net_worth='garbage')
        aml_kyc_values = AmlKycOptions().get_values(instance=kyc_record)

        for kyc_value in aml_kyc_values:
            if kyc_value['id'] == 'aml-kyc-net_worth':
                self.assertEqual(kyc_value['value'], 'garbage')

        investment_amount = InvestmentAmountFactory(amount=20000000, leverage_ratio=3)
        investment_amount_values = InvestmentAmountOptions().get_values(instance=investment_amount)

        for investment_amount_value in investment_amount_values:
            if investment_amount_value['id'] == 'ia-amount':
                self.assertEqual(investment_amount_value['value'], '20,000,000.00')
            if investment_amount_value['id'] == 'ia-leverage_amount':
                self.assertEqual(investment_amount_value['value'], '60,000,000.00')

    def test_vehicle_values(self):
        application = ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=self.user,
            eligibility_response=self.create_eligibility_criteria_user_response(company_user=self.company_user),
            kyc_record=None,
            tax_record=None,
            vehicle=CompanyFundVehicleFactory(company=self.company, name='sidecar-vehicle')
        )

        application_values = ApplicationOptions().get_values(instance=application)
        vehicle_field = self.get_field(application_values, 'application-vehicle')
        vehicle_field_feeder = self.get_field(application_values, 'application-feeder_name')
        self.assertEqual(vehicle_field['value'], 'sidecar-vehicle')
        self.assertEqual(vehicle_field_feeder['value'], 'sidecar-vehicle')

        application.vehicle = None
        application.save()

        application_values = ApplicationOptions().get_values(instance=application)
        vehicle_field = self.get_field(application_values, 'application-vehicle')
        vehicle_field_feeder = self.get_field(application_values, 'application-feeder_name')
        self.assertEqual(vehicle_field['value'], None)
        self.assertEqual(vehicle_field_feeder['value'], '')

    def test_share_class_values(self):
        vehicle = CompanyFundVehicleFactory(company=self.company, name='sidecar-vehicle')
        fund_share_class = FundShareClassFactory(
            fund=self.fund,
            leverage=3,
            company=self.company,
            company_fund_vehicle=vehicle,
            legal_name='C',
            display_name='C',
        )
        application = ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=self.user,
            eligibility_response=self.create_eligibility_criteria_user_response(company_user=self.company_user),
            kyc_record=None,
            tax_record=None,
            share_class=fund_share_class
        )

        application_values = ApplicationOptions().get_values(instance=application)
        field = next((field for field in application_values if field['id'] == "application-share_class_is_c"), None)
        self.assertTrue(field['value'])
        fund_share_class.display_name = 'New Name - C - UK'
        fund_share_class.legal_name = 'New Name - C - UK'
        fund_share_class.save()
        application.refresh_from_db()
        application.share_class.refresh_from_db()

        application_values = ApplicationOptions().get_values(instance=application)
        field = next((field for field in application_values if field['id'] == "application-share_class_is_c"), None)
        self.assertFalse(field['value'])

        fund_share_class.internal_name = 'C'
        fund_share_class.save()
        application.refresh_from_db()
        application.share_class.refresh_from_db()
        application_values = ApplicationOptions().get_values(instance=application)
        field = next((field for field in application_values if field['id'] == "application-share_class_is_c"), None)
        self.assertTrue(field['value'])
