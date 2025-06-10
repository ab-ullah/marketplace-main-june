from enum import Enum


class WorkflowTypes(Enum):
    INDIVIDUAL = "KYC / AML individual"
    PRIVATE_COMPANY = "KYC / AML corporate entity"
    LIMITED_PARTNERSHIP = "KYC / AML partnership"
    TRUST = "KYC / AML trust"
