import base64

from pydantic import BaseModel, Field, model_serializer, PrivateAttr
from enum import Enum
from typing import Any, Optional


class Fund(BaseModel):
    name: str = Field(alias="Name")
    common_name: str = Field(alias="InvestmentVehicleCommonName")
    internal_id: str = Field(alias="_id")


class ContactSearchResult(BaseModel):
    internal_id: str = Field(alias="_id", default=None)
    email: str = Field(alias="ContactInfo_Email")


class Contact(BaseModel):
    internal_id: str = Field(alias="_id", default=None)
    first_name: str = Field(alias='FirstName', default=None)
    last_name: str = Field(alias='LastName', default=None)
    email: str = Field(alias='ContactInfo_Email', default=None)
    contact_type: str = Field(alias='Contacttype', default='Primary Contact')
    job_title: Optional[str] = Field(alias='Jobtitle', default=None)
    _entity: str = 'Contact'
    roles: str = Field(alias='Roles', default=None)  # 'Primary Investor, Parent'

    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class InvestorAccount(BaseModel):
    internal_id: str = Field(alias='_id', default=None)
    email: str = Field(alias='Primarycontactemail', default=None)
    account_name: str = Field(alias='Fulllegalname', default=None)
    name: str = Field(alias='Name', default=None)
    investor_type: str = Field(alias='InvestorType',
                               default='Individual - Employee Co-Investment')  # for individuals, need one for trust and corporation.
    account_status: str = Field(alias='Accountstatus', default='Active - Employee Co-Investment')
    first_quarter_invested: str = Field(alias='FirstYearInvested',
                                        default=None)  # quarter and year of close (only for a new record)
    investor_account_code: str = Field(alias='InvestorAccountCode', default=None)
    risk_value: str = Field(alias='AMLRating', default=None)  # Low/ Medium/ High
    kyc_aml_completed_date: str = Field(alias='DateAMLRecieved', default=None)
    investor_location: str = Field(alias='InvestorCountry', default=None)
    on_boarding_status: str = Field(alias='On-BoardingStatus', default='Complete')
    portal_status: str = Field(alias='InvestorPortalStatus', default='No Portal Required')
    aml_received: str = Field(alias='AMLreceived', default='TRUE')
    _entity: str = 'InvestorAccount'


class InvestorAccountContact(BaseModel):
    investor_account: InvestorAccount
    contact_id: str
    _entity: str = 'InvestorAccount_Contact'

    @model_serializer
    def as_dict(self):
        return {
            "_id1": self.investor_account.internal_id,
            '_id2': self.contact_id,
            'Roles': "Primary Contact; Parent Investor"
        }


class InvestorAccountToFund(BaseModel):
    investor_account: InvestorAccount
    fund_internal_id: str
    _entity: str = 'InvestorAccount_Fund'

    @model_serializer
    def as_dict(self):
        return {
            "_id1": self.investor_account.internal_id,
            '_id2': self.fund_internal_id,
            'StatusinFund': "Active",
            'Roles': "Active Investor"
        }


class Document(BaseModel):
    id: str = Field(alias='_id', default=None)
    internal_id: str = Field(alias='SidecarID')
    title: str = Field(alias="Title", default="")
    start_date: str = Field(alias='Documentdate', default=None)
    extension: str = Field(alias="Extension", default=".pdf")  # must include the .
    content: str = Field(alias="_content", default=None)  # base64 encoded byte string of document contents
    category: str = Field(alias='Documentcategories', default=None)
    _entity: str = 'Document'
    _sidecar_document: Any = PrivateAttr()

    def add_file_content(self, content: str) -> None:
        content_bytes = base64.b64encode(content)
        self.content = content_bytes.decode('ascii')

    def set_extension(self, extension):
        if extension[0] == '.':
            self.extension = extension
        else:
            self.extension = ".{}".format(extension)

    def set_document(self, doc):
        self._sidecar_document = doc


class InvestorToDocument(BaseModel):
    investor: InvestorAccount
    document: Document
    _entity: str = 'InvestorAccount_Document'

    @model_serializer
    def as_dict(self):
        return {
            "_id1": self.investor.internal_id,
            '_id2': self.document.internal_id,
        }


class FundToDocument(BaseModel):
    fund_id: str
    document: Document
    _entity: str = 'Fund_Document'

    @model_serializer
    def as_dict(self):
        return {
            "_id1": self.fund_id,
            '_id2': self.document.internal_id,
        }
