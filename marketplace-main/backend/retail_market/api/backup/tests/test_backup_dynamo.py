import tempfile
import uuid
import api.backup.services.dynamo_crm.models as dynamo_model
from api.backup.models import DynamoFund

from api.backup.tests.test_backup_fund import CompleteApplication
from api.backup.services.dynamo_crm.dynamo_client import DynamoClient
from api.cards.models import Workflow
from api.constants.field_options import EmploymentStatus
from api.constants.kyc_investor_types import KYCInvestorType
from api.geographics.models import Country
from api.funds.models import Fund, FundShareClass
from api.applications.models import Application
from api.users.models import RetailUser
from api.admin_users.models import AdminUser
from api.companies.models import CompanyUser
from api.tax_records.models import TaxRecord, TaxRecordStatus, TaxForm
from api.kyc_records.models import KYCRecord, KYCStatuses, KYCRiskEvaluation
from api.companies.models import Company, CompanyFundVehicle
from api.investors.models import Investor
from api.documents.models import TaxDocument, Document, KYCDocument, FundDocument
from api.agreements.models import ApplicantAgreementDocument
from django.db.transaction import atomic
from unittest.mock import MagicMock, Mock
from datetime import date

test_funds = [
    dynamo_model.Fund(Name="Navable Global Employee Coinvest L.P Asia X",
                      InvestmentVehicleCommonName="Asia X",
                      _id="0xDEADBEEF"),
    dynamo_model.Fund(Name="Navable Global Employee Coinvest L.P Asia IX",
                      InvestmentVehicleCommonName="Asia IX",
                      _id="0xDEADBEEF"),
    dynamo_model.Fund(Name="Navable Global Employee Coinvest L.P Asia I",
                      InvestmentVehicleCommonName="Asia I",
                      _id="0xDEADBEEF"),

]
test_investors = [
    dynamo_model.InvestorAccount(
        _id='test-investor-account-001',
        Primarycontactemail="test1@navable.test",
        Fulllegalname="Test Smith",
        Name="Test Smith",
        InvestorAccountCode='tinvest001',
    ),
    dynamo_model.InvestorAccount(
        _id='test-investor-account-002',
        Primarycontactemail="test2@navable.test",
        Fulllegalname="Test Smyth",
        Name="Smyth Family Trust",
        InvestorAccountCode='tinvest002',
    ),
    dynamo_model.InvestorAccount(
        _id='test-investor-account-003',
        Primarycontactemail="test3@navable.test",
        Fulllegalname="Test Cray",
        Name="Cray Global L.P.",
        InvestorAccountCode='tinvest003',
    ),
]
test_contacts = [
    dynamo_model.ContactSearchResult(
        _id='test-contact-account-001',
        ContactInfo_Email='test1@navable.test',
    ),
    dynamo_model.ContactSearchResult(
        _id='test-contact-account-002',
        ContactInfo_Email='test2@navable.test',
    ),
    dynamo_model.ContactSearchResult(
        _id='test-contact-account-003',
        ContactInfo_Email='test3@navable.test',
    ),

]
test_documents = [
    dynamo_model.Document(
        _id='test-document-001',
        SidecarID='sidecar-test-tax-doc1',
        Title='W8.pdf',
        Documentcategories='Tax Document',
    ),
    dynamo_model.Document(
        _id='test-document-002',
        SidecarID='doc2',
        Title='W8.pdf',
        Documentcategories='Tax Document',
    ),
    dynamo_model.Document(
        _id='test-document-003',
        SidecarID='doc3',
        Title='W8.pdf',
        Documentcategories='Tax Document',
    ),
    dynamo_model.Document(
        _id='test-document-003',
        SidecarID='sidecar-test-tax-doc2',
        Title='Individual Self Certification.pdf',
        Documentcategories='Tax Document',
    ),
    dynamo_model.Document(
        _id='test-document-004',
        SidecarID='sidecar-test-tax-doc3',
        Title='W9.pdf',
        Documentcategories='Tax Document',
    ),
    dynamo_model.Document(
        _id='test-document-005',
        SidecarID='sidecar-test-tax-doc4',
        Title='Individual Self Certification.pdf',
        Documentcategories='Tax Document',
    ),
    dynamo_model.Document(
        _id='test-document-006',
        SidecarID='sidecar-test-kyc-doc1',
        Title='drivers license.pdf',
        Documentcategories='Tax Document',
    ),
    dynamo_model.Document(
        _id='test-document-007',
        SidecarID='sidecar-test-signed-doc1',
        Title='signed doc.pdf',
        Documentcategories='Subscription Documents',
    ),

]


class TestContext:
    def __init__(self):
        uuid1 = uuid.uuid4().hex
        uuid2 = uuid.uuid4().hex
        uuid3 = uuid.uuid4().hex
        uuid4 = uuid.uuid4().hex
        uuid5 = uuid.uuid4().hex
        uuid6 = uuid.uuid4().hex
        uuid7 = uuid.uuid4().hex
        uuid8 = uuid.uuid4().hex
        uuid9 = uuid.uuid4().hex
        uuid10 = uuid.uuid4().hex
        uuid11 = uuid.uuid4().hex
        uuid12 = uuid.uuid4().hex
        uuid13 = uuid.uuid4().hex
        uuid14 = uuid.uuid4().hex

        company = Company(
            name='Shelby Company Limited'
        )
        company_vehicle = CompanyFundVehicle(
            name='Navable Global Employee Coinvest L.P',
            company=company
        )

        fund = Fund(
            company=company,
            name="Asia IX",
            partner_id='0xDEADBEEF',
        )
        dynamo_fund = DynamoFund(
            fund=fund,
            dynamo_id="0xDEADBEEF"
        )
        fund.dynamo_fund = dynamo_fund
        self.fund = fund

        share_classes = [
            FundShareClass(
                display_name="A",
                legal_name="A",
                company=company,
                fund=fund,
                company_fund_vehicle=company_vehicle,
            ),
            FundShareClass(
                display_name="B",
                legal_name="B",
                company=company,
                fund=fund,
                company_fund_vehicle=company_vehicle,
            ),
        ]

        workflow = Workflow(
            name="Test Workflow",
            slug="shelby-test-workflow",
            company=company,
            type=1,
            fund=fund,
        )

        user_one = RetailUser(
            email='test1@navable.test',
            username='test1@navable.test',
            full_name='Tommy Bahama',
            first_name="Tommy",
            last_name="Bahama22"
        )
        user_two = RetailUser(
            email='test2@navable.test',
            username='test2@navable.test',
            full_name="John Snow",
            last_name="Snow",
            first_name="John"
        )

        user_three = RetailUser(
            email='test3@navable.test',
            username='test3@navable.test',
            full_name="John Smythe",
            last_name="Smythe",
            first_name="John"
        )

        user_four = RetailUser(
            email='qa+partnership@navable.test',
            username='qa+partnership@navable.test',
            full_name="Jack Sparrow",
            last_name="Sparrow",
            first_name="Jack"
        )

        company_user1 = CompanyUser(
            user=user_one,
            company=company,
            partner_id=uuid1
        )

        company_user2 = CompanyUser(
            user=user_two,
            company=company,
            partner_id=uuid2,
        )

        company_user3 = CompanyUser(
            user=user_three,
            company=company,
            partner_id=uuid3
        )

        company_user4 = CompanyUser(
            user=user_four,
            company=company,
            partner_id=uuid4
        )

        countries = [
            Country(
                name='uk',
                iso_code='uk'
            ),
            Country(
                name='us',
                iso_code='us'
            ),
        ]

        kyc1 = KYCRecord(
            uuid=uuid3,
            status=KYCStatuses.APPROVED,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL,
            first_name=user_one.first_name,
            last_name=user_one.last_name,
            employment_status=EmploymentStatus.EMPLOYED,
            employer_name="Shelby Company Limited",
            occupation="Tester",
            citizenship_country=countries[0],  # UK
            investor_location=countries[0],
            uk_national_insurance_number="uknin111",
            user=user_one,
            company=company,
            workflow=workflow,
            job_title="QA Tester",
        )
        kyc2 = KYCRecord(
            uuid=uuid4,
            status=KYCStatuses.APPROVED,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL,
            first_name=user_two.first_name,
            last_name=user_two.last_name,
            employment_status=EmploymentStatus.EMPLOYED,
            employer_name="Shelby Company Limited",
            occupation="Tester",
            citizenship_country=countries[1],  # US
            investor_location=countries[1],
            user=user_two,
            company=company,
            workflow=workflow,
            job_title="QA Tester",

        )
        kyc3 = KYCRecord(
            uuid=uuid5,
            status=KYCStatuses.APPROVED,
            kyc_investor_type=KYCInvestorType.TRUST,
            first_name=user_three.first_name,
            last_name=user_three.last_name,
            entity_name='Smythe Family Trust',
            employment_status=EmploymentStatus.EMPLOYED,
            employer_name="Shelby Company Limited",
            occupation="Tester",
            citizenship_country=countries[1],  # us
            investor_location=countries[1],
            user=user_three,
            company=company,
            workflow=workflow,
            job_title="QA Tester",
        )
        kyc4 = KYCRecord(
            uuid=uuid6,
            status=KYCStatuses.APPROVED,
            kyc_investor_type=KYCInvestorType.LIMITED_PARTNERSHIP,
            first_name=user_four.first_name,
            last_name=user_four.last_name,
            entity_name='Black Pearl L.P.',
            employment_status=EmploymentStatus.EMPLOYED,
            employer_name="Shelby Company Limited",
            occupation="Tester",
            citizenship_country=countries[1],  # us
            investor_location=countries[1],
            user=user_four,
            company=company,
            workflow=workflow,
            job_title="QA Tester",

        )

        tax1 = TaxRecord(
            uuid=uuid3,
            status=TaxRecordStatus.APPROVED,
            user=user_one,
            company=company,
        )
        tax2 = TaxRecord(
            uuid=uuid4,
            status=TaxRecordStatus.APPROVED,
            user=user_two,
            company=company,
        )
        tax3 = TaxRecord(
            uuid=uuid5,
            status=TaxRecordStatus.APPROVED,
            user=user_three,
            company=company,
        )
        tax4 = TaxRecord(
            uuid=uuid6,
            status=TaxRecordStatus.APPROVED,
            user=user_four,
            company=company,
        )

        default_content_type = "application/pdf"

        docs = [
            # 0
            Document(
                partner_id='sidecar-test-tax-doc1',
                document_id=uuid1,
                title='W8',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.TAX_DOCUMENT,
                deleted=False,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user1,
                document_path="/test/docs",
            ),
            # 1
            Document(
                partner_id='sidecar-test-tax-doc2',
                document_id=uuid2,
                title='Individual Self Certification',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.TAX_DOCUMENT,
                deleted=False,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user1,
                document_path="/test/docs",
            ),
            # 2
            Document(
                partner_id='sidecar-test-tax-doc3',
                document_id=uuid3,
                title='W9',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.TAX_DOCUMENT,
                deleted=False,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user2,
                document_path="/test/docs",
            ),
            # 3
            Document(
                partner_id='sidecar-test-tax-doc4',
                document_id=uuid4,
                title='Individual Self Certification',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.TAX_DOCUMENT,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user2,
                document_path="/test/docs",
            ),
            # 4
            Document(
                partner_id='sidecar-test-tax-doc5',
                document_id=uuid11,
                title='W8 BEN',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.TAX_DOCUMENT,
                deleted=False,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user3,
                document_path="/test/docs",
            ),
            # 5
            Document(
                partner_id='sidecar-test-tax-doc6',
                document_id=uuid12,
                title='Entity Self Certification',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.TAX_DOCUMENT,
                deleted=False,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user3,
                document_path="/test/docs",
            ),
            # 6
            Document(
                partner_id='sidecar-test-tax-doc7',
                document_id=uuid13,
                title='W8 BEN',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.TAX_DOCUMENT,
                deleted=False,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user4,
                document_path="/test/docs",
            ),
            # 7
            Document(
                partner_id='sidecar-test-tax-doc8',
                document_id=uuid14,
                title='Entity Self Certification',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.TAX_DOCUMENT,
                deleted=False,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user4,
                document_path="/test/docs",
            ),
            # 8
            Document(
                partner_id='sidecar-test-kyc-doc1',
                document_id=uuid5,
                title='Drivers License',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.KYC_DOCUMENT,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user2,
                document_path="/test/docs",
            ),
            # 9
            Document(
                partner_id='sidecar-test-signed-doc1',
                document_id=uuid6,
                title='Signed Subscription Doc',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.FUND_AGREEMENT_DOCUMENT,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user2,
                document_path="/test/docs",
            ),
            # 10
            Document(
                partner_id='sidecar-test-signed-doc2',
                document_id=uuid7,
                title='Signed Subscription Doc',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.FUND_AGREEMENT_DOCUMENT,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user3,
                document_path="/test/docs",
            ),
            # 11
            Document(
                partner_id='sidecar-test-signed-doc3',
                document_id=uuid8,
                title='Signed Subscription Doc',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.FUND_AGREEMENT_DOCUMENT,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user4,
                document_path="/test/docs",
            ),
            # 12
            Document(
                partner_id='sidecar-test-kyc-doc3',
                document_id=uuid9,
                title='Drivers License',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.KYC_DOCUMENT,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user3,
                document_path="/test/docs",
            ),
            # 13
            Document(
                partner_id='sidecar-test-kyc-doc4',
                document_id=uuid10,
                title='Drivers License',
                content_type=default_content_type,
                extension="pdf",
                document_type=Document.DocumentType.KYC_DOCUMENT,
                file_date=date.fromisoformat("2023-10-23"),
                uploaded_by_user=company_user4,
                document_path="/test/docs",
            ),

        ]

        tax_form = TaxForm(
            form_id='tax-123',
            version='v1.0',
            file_name='wx.pdf',
            company=company,
            details="tax doc",
            description="something that must be filled out"
        )

        tax_docs = [
            TaxDocument(
                tax_record=tax1,
                approved=True,
                completed=True,
                partner_id="sidecar-test-tax-doc1",
                document=docs[0],
                form=tax_form,
                owner=user_one,
            ),
            TaxDocument(
                tax_record=tax1,
                approved=True,
                completed=True,
                partner_id="sidecar-test-tax-doc2",
                document=docs[1],
                form=tax_form,
                owner=user_one,
            ),
            TaxDocument(
                tax_record=tax2,
                approved=True,
                completed=True,
                partner_id="sidecar-test-tax-doc3",
                document=docs[2],
                form=tax_form,
                owner=user_two,
            ),
            TaxDocument(
                tax_record=tax2,
                approved=True,
                completed=True,
                partner_id="sidecar-test-tax-doc4",
                document=docs[3],
                form=tax_form,
                owner=user_two,
            ),
            TaxDocument(
                tax_record=tax3,
                approved=True,
                completed=True,
                partner_id="sidecar-test-tax-doc5",
                document=docs[4],
                form=tax_form,
                owner=user_three,
            ),
            TaxDocument(
                tax_record=tax3,
                approved=True,
                completed=True,
                partner_id="sidecar-test-tax-doc6",
                document=docs[5],
                form=tax_form,
                owner=user_three,
            ),
            TaxDocument(
                tax_record=tax4,
                approved=True,
                completed=True,
                partner_id="sidecar-test-tax-doc7",
                document=docs[6],
                form=tax_form,
                owner=user_four,
            ),
            TaxDocument(
                tax_record=tax4,
                approved=True,
                completed=True,
                partner_id="sidecar-test-tax-doc8",
                document=docs[7],
                form=tax_form,
                owner=user_four,
            )
        ]

        kyc_docs = [
            KYCDocument(
                kyc_record=kyc2,
                document=docs[8],
                kyc_record_file_id=uuid.uuid4().hex,
                partner_id="sidecar-test-kyc-doc1"
            ),
            KYCDocument(
                kyc_record=kyc2,
                document=docs[9],
                kyc_record_file_id=uuid.uuid4().hex,
                partner_id="sidecar-test-kyc-doc2"
            ),
            KYCDocument(
                kyc_record=kyc3,
                document=docs[12],
                kyc_record_file_id=uuid.uuid4().hex,
                partner_id="sidecar-test-kyc-doc3"
            ),
            KYCDocument(
                kyc_record=kyc4,
                document=docs[13],
                kyc_record_file_id=uuid.uuid4().hex,
                partner_id="sidecar-test-kyc-doc4"
            ),
        ]

        admin1 = AdminUser(
            user=user_one,
            company=company
        )

        risks = [
            KYCRiskEvaluation(
                risk_value=KYCRiskEvaluation.RiskValueChoices.LOW,
                kyc_record=kyc1,
                reviewer=admin1),
            KYCRiskEvaluation(
                risk_value=KYCRiskEvaluation.RiskValueChoices.LOW,
                kyc_record=kyc2,
                reviewer=admin1),
            KYCRiskEvaluation(
                risk_value=KYCRiskEvaluation.RiskValueChoices.LOW,
                kyc_record=kyc3,
                reviewer=admin1),
            KYCRiskEvaluation(
                risk_value=KYCRiskEvaluation.RiskValueChoices.LOW,
                kyc_record=kyc4,
                reviewer=admin1),
        ]

        a1 = Application(
            user=user_one,
            uuid=uuid1,
            company=company,
            fund=fund,
            share_class=share_classes[0],
            vehicle=company_vehicle,
            kyc_record=kyc1,
            tax_record=tax1
        )
        a2 = Application(
            user=user_two,
            uuid=uuid2,
            company=company,
            fund=fund,
            share_class=share_classes[1],
            vehicle=company_vehicle,
            kyc_record=kyc2,
            tax_record=tax2,
        )
        a3 = Application(
            user=user_three,
            uuid=uuid3,
            company=company,
            fund=fund,
            share_class=share_classes[1],
            vehicle=company_vehicle,
            kyc_record=kyc3,
            tax_record=tax3,
        )
        a4 = Application(
            user=user_four,
            uuid=uuid4,
            company=company,
            fund=fund,
            share_class=share_classes[1],
            vehicle=company_vehicle,
            kyc_record=kyc4,
            tax_record=tax4,
        )

        a1.acceptance_date = MagicMock(return_value=date.today())
        a2.acceptance_date = MagicMock(return_value=date.today())
        a3.acceptance_date = MagicMock(return_value=date.today())
        a4.acceptance_date = MagicMock(return_value=date.today())

        class myInvestor:
            def __init__(self, investor_account_code):
                self.investor_account_code = investor_account_code

        investors = [
            Investor(investor_account_code='tinvest001'),
            Investor(investor_account_code='tinvest002'),
            Investor(investor_account_code='tinvest003'),
            Investor(investor_account_code='tinvest004'),
        ]

        a1.investor = investors[0]
        a2.investor = investors[1]
        a3.investor = investors[2]
        a4.investor = investors[3]

        self.applications = [
            a1,
            a2,
            a3,
            a4,
        ]

        agreement_document = FundDocument(
            fund=fund,
            document=docs[9],

        )

        signed_docs = [
            ApplicantAgreementDocument(
                application=a2,
                signed_document=docs[9],
                completed=True,
                agreement_document=agreement_document,
            ),
            ApplicantAgreementDocument(
                application=a3,
                signed_document=docs[10],
                completed=True,
                agreement_document=agreement_document,
            ),
            ApplicantAgreementDocument(
                application=a4,
                signed_document=docs[11],
                completed=True,
                agreement_document=agreement_document,
            ),
        ]

        with atomic():
            for thing in [company,
                          company_vehicle,
                          user_two,
                          user_one,
                          user_three,
                          user_four,
                          company_user1,
                          company_user2,
                          company_user3,
                          company_user4,
                          fund,
                          *share_classes,
                          workflow,
                          tax1,
                          tax2,
                          tax3,
                          tax4,
                          tax_form,
                          *docs,
                          *tax_docs,
                          *countries,
                          kyc1,
                          kyc2,
                          kyc3,
                          kyc4,
                          *kyc_docs,
                          admin1,
                          *risks,
                          *investors,
                          *self.applications,
                          agreement_document,
                          *signed_docs,
                          ]:
                thing.save()


class LocalTC:
    def __init__(self, **kwargs):
        self.email = kwargs.get('email', '')
        self.new_contact = kwargs.get('new_contact', True)
        self.new_investor_account = kwargs.get('new_investor_account', True)
        self.new_documents = kwargs.get('new_documents')

    def message(self, change, desc=""):
        return "for {}:{}\nNew Contact wanted {} got {}\nNew Investor wanted {} got {}\nNew Documents wanted {} got {}\n{}\n{}".format(
            self.email,
            change.application.user.email,
            self.new_contact,
            change.new_contact,
            self.new_investor_account,
            change.new_investor_account,
            self.new_documents,
            len(change.new_documents),
            change.new_documents,
            desc,
        )


class BackupFundToDynamoServiceTestCase(CompleteApplication):

    @staticmethod
    def get_object(*args) -> dict:
        fp = tempfile.TemporaryFile()
        fp.write(b'What a wonderful world of tests!')
        fp.seek(0)
        return {
            'Body': fp
        }

    def setUp(self):
        document_api = Mock()
        document_api.get_obj = BackupFundToDynamoServiceTestCase.get_object
        self.dynamo_service = DynamoClient(
            base_url="http://dynamock.local/api/v2.1",
            api_key="you-probably-think-this-key-is-about-you==",
            plan_only=False,
            document_api=document_api
        )

        self.dynamo_service._get_existing_funds = MagicMock(return_value=test_funds)
        self.dynamo_service._get_existing_investors = MagicMock(return_value=test_investors)
        self.dynamo_service._get_existing_contacts = MagicMock(return_value=test_contacts)
        self.dynamo_service._get_existing_documents = MagicMock(return_value=test_documents)
        self.dynamo_service.add_documents = Mock()
        self.dynamo_service.add_investor = Mock()
        self.dynamo_service.add_contact = Mock()
        self.dynamo_service.update_investor = Mock()
        self.dynamo_service.update_contact = Mock()
        self.dynamo_service.link_investor_to_fund = Mock()
        self.context = TestContext()

    def test_sync_to_dynamo(self):
        plan = self.dynamo_service.sync(self.context.applications, self.context.fund)
        self.assertEqual(plan.success, True)
        self.assertEqual(plan.changes_written, True)
        self.assertEqual(len(plan.errors), 0)
        self.assertEqual(len(self.context.applications), len(plan.changes))
        test_cases = {
            'test1@navable.test':
                LocalTC(email='test1@navable.test',
                        new_contact=False,
                        new_investor_account=False,
                        new_documents=0),
            'test2@navable.test':
                LocalTC(email='test2@navable.test',
                        new_contact=False,
                        new_investor_account=False,
                        new_documents=0),
            'test3@navable.test':
                LocalTC(email='test3@navable.test',
                        new_contact=False,
                        new_investor_account=False,
                        new_documents=4),
            'qa+partnership@navable.test':
                LocalTC(email='qa+partnership@navable.test',
                        new_contact=True,
                        new_investor_account=True,
                        new_documents=4)
        }

        for change in plan.changes:
            email = change.application.user.email
            test_case = test_cases.get(email)
            self.assertIsNotNone(test_case, "Expected a test case for change with email {}".format(email))

            self.assertEqual(test_case.new_contact, change.new_contact, test_case.message(change))
            self.assertEqual(test_case.new_investor_account, change.new_investor_account, test_case.message(change))
            self.assertEqual(test_case.new_documents, len(change.new_documents), test_case.message(change))

        self.assertEqual(self.dynamo_service.link_investor_to_fund.call_count, 4)
