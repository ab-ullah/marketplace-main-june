from api.documents.models import Document
from api.funds.models import Fund
from api.investors.models import Investor

FUND_TYPE_MAPPING = {
    'open': Fund.FundTypeChoice.OPEN.value,
    'closed': Fund.FundTypeChoice.CLOSED.value
}

BUSINESS_LINE_MAPPING = {
    'americas_private': Fund.BusinessLineChoice.AMERICAS_PRIVATE.value,
    'asia_pacific_private': Fund.BusinessLineChoice.ASIA_PACIFIC_PRIVATE.value,
    'europe_private': Fund.BusinessLineChoice.EUROPE_PRIVATE.value,
    'global_partner_solutions': Fund.BusinessLineChoice.GLOBAL_PARTNER_SOLUTIONS.value,
    'global_securities': Fund.BusinessLineChoice.GLOBAL_SECURITIES.value,
}

VEHICLE_TYPE_MAPPING = {
    'individual': Investor.VehicleTypeChoice.INDIVIDUAL.value
}

DOCUMENT_TYPE_MAPPING = {
    'prospectus': Document.DocumentType.PROSPECTUS.value,
    'pitchbook': Document.DocumentType.PITCH_BOOK.value,
    'capital-calls': Document.DocumentType.CAPITAL_CALL.value,
    'capital-call': Document.DocumentType.CAPITAL_CALL.value,
    'distributions': Document.DocumentType.DISTRIBUTIONS.value,
    'distribution': Document.DocumentType.DISTRIBUTIONS.value,
    'investor-reports': Document.DocumentType.INVESTOR_REPORTS.value,
    'financial-statements': Document.DocumentType.FINANCIAL_STATEMENTS.value,
    'purchase-agreements': Document.DocumentType.PURCHASE_AGREEMENTS.value,
    'subscription-documents': Document.DocumentType.SUBSCRIPTION_DOCUMENTS.value,
    'agreement': Document.DocumentType.AGREEMENT.value,
    'interest-statement': Document.DocumentType.INTEREST_STATEMENT.value,
    'nav-statement': Document.DocumentType.NAV_STATEMENT.value,
    'other': Document.DocumentType.OTHER.value,
    'tax': Document.DocumentType.TAX.value,
    'fund-agreement-documents': Document.DocumentType.FUND_AGREEMENT_DOCUMENT.value,
    "financial-information": Document.DocumentType.FINANCIAL_INFORMATION.value,
    "property-portfolio" : Document.DocumentType.PROPERTY_PORTFOLIO.value,
    "quarterly-report": Document.DocumentType.QUARTERLY_REPORT.value,
    "ethics": Document.DocumentType.ETHICS.value,
    "investor-meeting-materials": Document.DocumentType.INVESTOR_MEETING_MATERIALS.value,
    "strategic-materials": Document.DocumentType.STRATEGIC_MATERIALS.value,
    "sustainability": Document.DocumentType.SUSTAINABILITY.value,
    "annual-report": Document.DocumentType.ANNUAL_REPORT.value,
    'monthly-report': Document.DocumentType.MONTHLY_REPORT.value,
}
