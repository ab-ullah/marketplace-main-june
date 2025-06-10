import http

import requests
import json
import logging

from requests import Response
from django.conf import settings

from api.applications.models import Application
from api.libs.utils.date_util import DateUtil
from api.agreements.models import ApplicantAgreementDocument
from api.libs.sidecar_blocks.document_store.document_api import Context, DocumentApi
from api.backup.services.dynamo_crm.models import (Fund,
                                                   Document,
                                                   Contact,
                                                   InvestorAccount,
                                                   FundToDocument,
                                                   InvestorAccountToFund,
                                                   InvestorToDocument,
                                                   InvestorAccountContact,
                                                   ContactSearchResult
                                                   )


class ChangesRequired:
    def __init__(self):
        self.successes = []
        self.errors = []
        self.fund = None
        self.contact = None
        self.new_contact = False
        self.new_investor_account = False
        self.new_documents = []
        self.investor = None
        self.contact = None
        self.application = None
        self.success_application_count = 0
        self.failed_application_count = 0

    def any_changes(self) -> bool:
        return self.new_contact or self.new_investor_account or len(self.new_documents) > 0

    def add_success(self, message):
        self.successes.append(message)

    def add_error(self, message):
        self.errors.append(message)

    def can_proceed(self) -> bool:
        return len(self.errors) == 0


class DynamoChangePlan:
    success: bool
    changes_written: bool
    steps: [str]
    errors: [str]
    changes: [ChangesRequired]

    def __init__(self):
        self.failures = []
        self.failed_application_count = 0
        self.success_application_count = 0
        self.steps = []
        self.errors = []
        self.changes = []
        self.success = True

    def increase_success_application_count(self):
        self.success_application_count += 1

    def increase_failed_application_count(self):
        self.failed_application_count += 1

    def add_application(self, application, changes_required: ChangesRequired) -> None:
        application_uuid = application.uuid
        email = application.user and application.user.email
        updates = [f"Syncing {application_uuid}:{email}",
                   f"\t{application_uuid} New Contact {changes_required.new_contact}",
                   f"\t{application_uuid} New Investor Account {changes_required.new_investor_account}",
                   f"\t{application_uuid} New Documents {len(changes_required.new_documents)}"]

        for success in changes_required.successes:
            updates.append("\tSuccess: {}".format(success))

        for error in changes_required.errors:
            error_message = f"\tError: {error}"
            if application.investor:
                error_message += f"Investor name: {application.investor.name} Investor Account Code: {application.investor.investor_account_code}"
            updates.append(error_message)

        self.steps.append("\n".join(updates))

        if changes_required.errors:
            self.increase_failed_application_count()
            self.add_failure("\n".join(updates))
        else:
            self.increase_success_application_count()

        changes_required.application = application
        self.changes.append(changes_required)

    def add_error(self, error_message) -> None:
        self.success = False
        self.errors.append(error_message)

    def add_failure(self, error_message) -> None:
        self.failures.append(error_message)

    def log_output(self) -> str:
        """This returns a string suitable for logging, in a nice multi line output"""
        output = []
        if self.changes_written:
            output.append("Changes were COMMITTED")
        else:
            output.append("Changes were PROPOSED")

        if len(self.errors) > 0:
            output.append("ERRORS")
            for position, error in enumerate(self.errors, start=1):
                output.append("\t{}: {}".format(position, error))

        if len(self.steps) > 0:
            output.append("STEPS")
            for step in self.steps:
                output.append("{}".format(step))

        output.append("success:{}".format(self.success))
        return "\n".join(output)

    def log_short_output(self) -> str:
        """This returns a string short version of the output, suitable for an email report"""
        output = [f"Successes count: {self.success_application_count}", f"Error count: {self.failed_application_count}"]
        if len(self.failures) > 0:
            output.append("Errors:")
            for position, failure in enumerate(self.failures, start=1):
                output.append(f"\t{position}: {failure}")

        return "\n".join(output)

    def can_proceed(self) -> bool:
        return len(self.errors) == 0


class DynamoClient:
    base_url: str
    api_key: str
    plan_only: bool
    existing_investors: dict
    existing_contacts: dict
    existing_funds: dict
    existing_documents: dict
    document_api: DocumentApi

    def __init__(self, base_url: str, api_key: str, plan_only: bool = False, document_api: DocumentApi = None,
                 context: Context = None, session: requests.Session = None):
        self.base_url = base_url
        self.api_key = api_key
        self.plan_only = plan_only
        self.session = session if session else requests.Session()

        if document_api is None:
            use_local = settings.AWS.local
            document_bucket = settings.AWS.document_bucket
            backup_document_bucket = settings.AWS.backup_bucket
            document_kms_key_id = settings.AWS.document_kms_key_id

            if document_bucket is None or document_bucket == "":
                raise AttributeError("Expected settings.AWS.document_bucket to be set")

            if backup_document_bucket is None or backup_document_bucket == "":
                raise AttributeError("Expected settings.AWS.backup_bucket to be set")

            if document_kms_key_id is None or document_kms_key_id == "":
                raise AttributeError("Expected settings.AWS.document_kms_key_id to be set")

            self.document_api = DocumentApi(document_bucket, document_kms_key_id)
            self.context = Context(use_local=use_local)
        else:
            # make it easy to test by allowing the document_api to be passed in, which allows us to use mocks :-)
            self.document_api = document_api
            self.context = context

    def sync(self, applications_to_sync, fund) -> DynamoChangePlan:
        plan = DynamoChangePlan()
        plan.changes_written = not self.plan_only
        self._index_investors()
        self._index_contacts()
        self._index_funds()
        self._index_documents()

        for application in applications_to_sync:
            dynamo_fund = self._get_dynamo_fund_for(fund.dynamo_fund.dynamo_id)

            if not dynamo_fund:
                plan.add_error(f"Could not find a fund in dynamo for id: '{fund.dynamo_fund.dynamo_id}' fund name: {fund.name}")
                continue

            changes_required = self.changes_for(application, dynamo_fund)

            # attempt to make the API transactional, only push
            # changes to Dynamo if we think we can proceed across the entities for this
            # one application.
            if not self.plan_only and plan.can_proceed():
                if changes_required.contact:
                    self.update_contact(application, changes_required)
                if changes_required.new_contact:
                    self.add_contact(application, changes_required)
                if changes_required.investor:
                    self.update_investor(application, changes_required)
                if changes_required.new_investor_account:
                    self.add_investor(application, changes_required)
                if changes_required.new_documents:
                    self.add_documents(application, changes_required)

                # Always try to link the investor to the fund.
                self.link_investor_to_fund(application, changes_required)

            plan.add_application(application, changes_required)

        return plan

    def _index_contacts(self) -> None:
        contacts: [ContactSearchResult] = self._get_existing_contacts()
        contact_index = {}
        for contact in contacts:
            contact_index[contact.email.lower()] = contact

        self.existing_contacts = contact_index

    def _index_investors(self) -> None:
        investors: [InvestorAccount] = self._get_existing_investors()
        investor_index = {}
        for investor in investors:
            investor_index[investor.investor_account_code] = investor  # match on investor account code, only

        self.existing_investors = investor_index

    def _index_funds(self) -> None:
        funds = self._get_existing_funds()
        fund_index = dict()

        for fund in funds:
            fund_index[fund.internal_id] = fund

        self.existing_funds = fund_index

    def _index_documents(self) -> None:
        documents = self._get_existing_documents()
        doc_index = {}

        for document in documents:
            doc_index[document.internal_id] = document

        self.existing_documents = doc_index

    def _get_dynamo_fund_for(self, dynamo_id: str) -> Fund:
        fund = self.existing_funds.get(dynamo_id, None)
        return fund

    def changes_for(self, application, dynamo_fund) -> ChangesRequired:
        cr = ChangesRequired()
        cr.fund = dynamo_fund
        self._changes_for_investor(application, cr)
        self._changes_for_documents(application, cr)

        return cr

    def _changes_for_documents(self, application, cr: ChangesRequired):
        kyc_docs = application.kyc_record.kyc_documents.all()
        for kyc_doc in kyc_docs:
            if self.existing_documents.get(kyc_doc.document.partner_id):
                continue

            doc = kyc_doc.document
            file_date = doc.file_date.strftime("%Y-%m-%d") if doc.file_date else doc.created_at.strftime("%Y-%m-%d")
            d = Document(
                SidecarID=doc.partner_id,
                Title=doc.title,
                Documentdate=file_date,
                Documentcategories="AML/KYC"
            )
            d.set_document(doc)
            d.set_extension(doc.extension)
            cr.new_documents.append(d)

        tax_docs = []
        if application.tax_record:
            tax_docs = application.tax_record.tax_documents.all()
        for tax_doc in tax_docs:
            if self.existing_documents.get(tax_doc.document.partner_id):
                continue

            doc = tax_doc.document
            file_date = doc.file_date.strftime("%Y-%m-%d") if doc.file_date else doc.created_at.strftime("%Y-%m-%d")
            d = Document(
                SidecarID=doc.partner_id,
                Title=doc.title,
                Documentdate=file_date,
                Documentcategories="Tax Document"
            )
            d.set_document(doc)
            d.set_extension(doc.extension)
            cr.new_documents.append(d)

        sub_docs = ApplicantAgreementDocument.objects.filter(application=application)
        for sub_doc in sub_docs:
            if self.existing_documents.get(sub_doc.signed_document.partner_id):
                continue

            doc = sub_doc.signed_document
            file_date = doc.file_date.strftime("%Y-%m-%d") if doc.file_date else doc.created_at.strftime("%Y-%m-%d")
            d = Document(
                SidecarID=doc.partner_id,
                Title=doc.title,
                Documentdate=file_date,
                Documentcategories="Subscription Documents"
            )
            d.set_document(doc)
            d.set_extension(doc.extension)
            cr.new_documents.append(d)

    def _changes_for_investor(self, application, dcp: ChangesRequired) -> None:
        email = application.user.email

        if application.investor and application.investor.investor_account_code:
            investor_account_code = application.investor.investor_account_code
            # check to see if an investor and contact can be found
            investor = self.existing_investors.get(investor_account_code, None)
            contact = self.existing_contacts.get(email.lower(), None)
    
            if contact:
                dcp.new_contact = False
                dcp.contact = contact
            else:
                dcp.new_contact = True
    
            if investor:
                dcp.investor = investor
                dcp.new_investor_account = False
            else:
                dcp.new_investor_account = True
        else:
            full_legal_name = application.kyc_record.get_display_name()
            dcp.add_error(f"Not adding investor: {full_legal_name} application uuid: {application.uuid} due to missing investor account code")
            logging.info(f"Not adding investor: {full_legal_name} application uuid: {application.uuid} due to missing investor account code")

    def add_contact(self, application, changes_required: ChangesRequired) -> None:
        if not changes_required.new_contact or not changes_required.can_proceed():
            return

        first_name = application.kyc_record.first_name
        last_name = application.kyc_record.last_name
        email = application.user.email
        job_title = application.kyc_record.job_title

        contact = Contact(
            FirstName=first_name,
            LastName=last_name,
            ContactInfo_Email=email,
            Jobtitle=job_title,
        )

        response = self._create_entity(contact)
        data = json.loads(response.content)

        if response.status_code == http.HTTPStatus.OK:
            contact_data = data.get("data", {})
            contact.internal_id = contact_data.get("_id", None)
            changes_required.add_success("contact created {}".format(contact.internal_id))

        else:
            changes_required.add_error("Could not create contact entity - {}:{}".format(
                response.status_code,
                data.get("error", "unspecified error"),
            ))

        changes_required.contact = contact

    def add_investor(self, application, changes_required: ChangesRequired) -> None:
        full_legal_name = application.kyc_record.get_display_name()
        if not changes_required.new_investor_account or not changes_required.can_proceed():
            logging.info(f"Not creating investor {full_legal_name} due to missing investor account code")
            return

        first_quarter_invested = DateUtil.get_quarter_name(application.acceptance_date())
        investor_account_code = application.investor.investor_account_code  # we already checked existence of IAC

        investor = InvestorAccount(
            Fulllegalname=full_legal_name,
            Name=full_legal_name,
            FirstYearInvested=first_quarter_invested,
            InvestorAccountCode=investor_account_code,
            AMLRating=str(application.kyc_record.risk_value_kyc.get_risk_value_display()),
            DateAMLRecieved=application.kyc_record.created_at.isoformat(),
            InvestorCountry=application.kyc_record.investor_location.name,
        )

        response = self._create_entity(investor)
        data = json.loads(response.content)

        if response.status_code == http.HTTPStatus.OK:
            investor_data = data.get("data", {})
            investor.internal_id = investor_data.get("_id", None)
            changes_required.add_success(f"investor created {investor.internal_id}")
        else:
            changes_required.add_error(f"Could not create investor entity - {data.get('error', 'unspecified error')}")

        changes_required.investor = investor

        if not changes_required.can_proceed():
            return

        relation_to_account = InvestorAccountContact(
            investor_account=investor,
            contact_id=changes_required.contact.internal_id
        )

        response = self._create_entity(relation_to_account)
        data = json.loads(response.content)

        if response.status_code == http.HTTPStatus.OK:
            changes_required.add_success("investor to Contact relation created")
        else:
            changes_required.add_error(f"Could not create investor to contact relation - { data.get('error', 'unspecified error')}")

    def link_investor_to_fund(self, application, changes_required: ChangesRequired):
        if not changes_required.can_proceed():
            return

        investor = changes_required.investor

        if investor is None:
            return

        relation_to_fund = InvestorAccountToFund(
            investor_account=investor,
            fund_internal_id=changes_required.fund.internal_id
        )

        response = self._create_entity(relation_to_fund)
        data = json.loads(response.content)

        if response.status_code == http.HTTPStatus.OK:
            changes_required.add_success("investor to fund relation created")
        else:
            changes_required.add_error("Could not create investor to fund relation - {}".format(
                data.get("error", "unspecified error")
            ))

    def add_documents(self, application, changes_required) -> None:
        if len(changes_required.new_documents) == 0 or not changes_required.can_proceed():
            return

        for doc in changes_required.new_documents:
            doc_contents = self.document_api.get_obj(self.context, doc._sidecar_document.document_path)
            file = doc_contents.get('Body')

            if not file:
                changes_required.add_error(
                    "Could not load the contents of the file for document {}:{}".format(doc.category, doc.partner_id)
                )
            else:
                contents = file.read()
                doc.add_file_content(contents)
                self.upload_document(changes_required, doc)

    def upload_document(self, changes_required, doc: Document):
        # upload the document, then with the new id, link it via fund and investor relations.
        response = self._create_entity(doc)
        data = json.loads(response.content)

        if response.status_code == http.HTTPStatus.OK:
            _data = data.get("data", {})
            doc.internal_id = _data.get("_id", None)
            changes_required.add_success("document created {}".format(doc.internal_id))

            link_to_investor = InvestorToDocument(
                document=doc,
                investor=changes_required.investor
            )

            response = self._create_entity(link_to_investor)
            data = json.loads(response.content)

            if response.status_code == http.HTTPStatus.OK:
                changes_required.add_success("{} document linked to investor".format(doc.internal_id))

            else:
                changes_required.add_error(
                    "could not link document to investor, got error {} and message {}".format(
                        response.status_code,
                        data.get("error", "unspecified error")
                    )
                )

            if doc.category != 'Tax Document':
                link_to_fund = FundToDocument(
                    fund_id=changes_required.fund.internal_id,
                    document=doc,
                )
                response = self._create_entity(link_to_fund)
                data = json.loads(response.content)

                if response.status_code == http.HTTPStatus.OK:
                    changes_required.add_success("{} document linked to fund".format(doc.internal_id))
                else:
                    changes_required.add_error(
                        "could not link document to fund got error {} and message {}".format(
                            response.status_code,
                            data.get("error", "unspecified error")
                        )
                    )
        else:
            changes_required.add_error(
                "could not upload document got error {} and message {}".format(
                    response.status_code,
                    data.get("error", "unspecified error")
                )
            )

    def _get_existing_funds(self) -> [Fund]:
        funds = []
        fund_search = '''{
    "advf": {
        "e": [
            {
                "_name": "Fund",
                "rule": [
                    {
                        "_op": "is_selected",
                        "_prop": "Employee Co-Investment"
                    }
                ]
            }
        ]
    }
}'''
        columns = {
            'x-columns': 'Name,Investment Vehicle Common Name,Internal ID'
        }
        response = self._make_request("POST", "/search", fund_search,
                                      headers=columns)

        if response.status_code == http.HTTPStatus.OK:
            response_data = json.loads(response.content)

            for fund_data in response_data['data']:
                fund = Fund(**fund_data)
                funds.append(fund)
        else:
            logging.error(f'''
                got an unexpected {response.status_code} 
                and a body {response.content}
            ''')

        return funds

    def _get_existing_contacts(self) -> [ContactSearchResult]:
        contacts = []
        contact_search = '''
        {
    "advf": {
        "e": [
            {
                "_name": "Contact",
                "e": [
                    {
                        "_name": "InvestorAccount",
                        "rule": [
                            {
                                "_op": "is",
                                "_prop": "Investor type",
                                "values": [
                                    {
                                        "id": "b1915199-ce2c-4e1a-a760-3c6c0f477d6b",
                                        "es": "L_InvestorCategory",
                                        "name": "Individual - Employee Co-investment"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "mode": "compact"
}'''
        columns = {
            'x-columns': 'Internal ID,email'
        }

        response = self._make_request("POST", "/search", contact_search,
                                      headers=columns)

        if response.status_code == http.HTTPStatus.OK:
            response_data = json.loads(response.content)

            for data in response_data['data']:
                model = ContactSearchResult(**data)
                contacts.append(model)
        else:
            logging.error(f'''
                got an unexpected {response.status_code} 
                and a body {response.content}
            ''')

        return contacts

    def _get_existing_investors(self) -> [InvestorAccount]:
        investors = []
        investor_search = '''
        {
    "advf": {
        "e": [
            {
                "_name": "InvestorAccount",
                "rule": [
                    {
                        "_op": "is",
                        "_prop": "Investor type",
                        "values": [
                            {
                                "id": "b1915199-ce2c-4e1a-a760-3c6c0f477d6b",
                                "es": "L_InvestorCategory",
                                "name": "Individual - Employee Co-investment"
                            }
                        ]
                    }
                ]
            },
            {
                "_name": "InvestorAccount",
                "e": [
                    {
                        "_name": "Contact"
                    }
                ]
            }
        ]
    },
    "mode": "extended"
}
        '''

        columns = {
            'x-columns': 'Fulllegalname,Internal ID,InvestorAccountCode,Primary contact email,InvestorType'
        }
        response = self._make_request("POST", "/search", investor_search,
                                      headers=columns)

        if response.status_code == http.HTTPStatus.OK:
            response_data = json.loads(response.content)

            for data in response_data['data']:
                model = InvestorAccount(**data)
                investors.append(model)
        else:
            logging.error(f'''
                got an unexpected {response.status_code} 
                and a body {response.content}
            ''')

        return investors

    def _get_existing_documents(self) -> [Document]:
        documents = []
        search_query = '''{
    "advf": {
        "e": [
            {
                "_name": "Document",
                "rule": [
                    {
                        "_op": "not_null",
                        "_prop": "SidecarID"
                    }
                ]
            }
        ]
    },
    "mode": "compact"
}
        '''
        columns = {
            'x-columns': 'Internal ID,SidecarID,Title,Start Date,Documentcategories'
        }
        response = self._make_request("POST", "/search", search_query,
                                      headers=columns)

        if response.status_code == http.HTTPStatus.OK:
            response_data = json.loads(response.content)

            for data in response_data['data']:
                model = Document(**data)
                documents.append(model)
        else:
            logging.error(f'''
                got an unexpected {response.status_code} 
                and a body {response.content}
            ''')

        return documents

    def _make_request(self, method, endpoint, data=None, headers=None) -> Response:
        headers = headers or {}
        headers['Authorization'] = f'Bearer {self.api_key}'
        url = f'{self.base_url}{endpoint}'
        response = self.session.request(method, url, json=data, headers=headers)
        return response

    def _create_entity(self, model_object) -> Response:
        data = model_object.model_dump(exclude_none=True, by_alias=True)
        response = self._make_request(
            "POST",
            "/Entity/{}".format(model_object._entity),
            data=data,
            headers={
                'x-importaction': 'create'
            },
        )
        return response

    def _update_entity(self, model_object) -> Response:
        response = self._make_request(
            "PUT",
            f"/Entity/{model_object._entity}",
            data=model_object.model_dump(exclude_unset=True, exclude_none=True, by_alias=True),
            headers={
                'x-importaction': 'update'
            }
        )

        return response

    def update_contact(self, application: Application, changes_required: ChangesRequired):
        if not changes_required.contact or not changes_required.can_proceed():
            return

        contact = Contact(
            FirstName=application.kyc_record.first_name,
            LastName=application.kyc_record.last_name,
            ContactInfo_Email=application.user.email,
            Jobtitle=application.kyc_record.job_title,
            _id=changes_required.contact.internal_id,
        )

        response = self._update_entity(contact)
        data = json.loads(response.content)

        if response.status_code == http.HTTPStatus.OK:
            contact_data = data.get("data", {})
            contact.internal_id = contact_data.get("_id", None)
            changes_required.add_success(f"contact updated {contact.internal_id}")
        else:
            changes_required.add_error(f"Could not update contact entity - {response.status_code}:{data.get('error', 'unspecified error')}")

    def update_investor(self, application, changes_required: ChangesRequired):
        if not changes_required.investor or not changes_required.can_proceed():
            return

        full_legal_name = application.kyc_record.get_display_name()
        first_quarter_invested = DateUtil.get_quarter_name(application.acceptance_date())
        investor_account_code = application.investor.investor_account_code  # we already checked existence of IAC
        investor = InvestorAccount(
            Fulllegalname=full_legal_name,
            Name=full_legal_name,
            FirstYearInvested=first_quarter_invested,
            InvestorAccountCode=investor_account_code,
            AMLRating=str(application.kyc_record.risk_value_kyc.get_risk_value_display()),
            DateAMLRecieved=application.kyc_record.created_at.isoformat(),
            InvestorCountry=application.kyc_record.investor_location.name,
            _id=changes_required.investor.internal_id
        )

        response = self._update_entity(investor)
        data = json.loads(response.content)

        if response.status_code == http.HTTPStatus.OK:
            investor_data = data.get("data", {})
            investor.internal_id = investor_data.get("_id", None)
            changes_required.add_success(f"investor updated {investor.internal_id}")
        else:
            changes_required.add_error(f"Could not update investor entity - {data.get('error', 'unspecified error')}")

        if not changes_required.can_proceed():
            return

        relation_to_account = InvestorAccountContact(
            investor_account=investor,
            contact_id=changes_required.contact.internal_id
        )

        response = self._update_entity(relation_to_account)
        data = json.loads(response.content)

        if response.status_code == http.HTTPStatus.OK:
            changes_required.add_success("investor to Contact relation updated")
        else:
            changes_required.add_error(
                f"Could not updated investor to contact relation - {data.get('error', 'unspecified error')}")
