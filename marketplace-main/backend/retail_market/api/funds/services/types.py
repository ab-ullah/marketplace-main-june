from typing import TypedDict, Optional

from api.funds.constants import EMAIL_FIELD, FIRST_NAME_FIELD, LAST_NAME_FIELD, JOB_BAND_FIELD, DEPARTMENT_FIELD, \
    OFFICE_LOCATION_FIELD, REGION_FIELD, MAX_LEVERAGE_FIELD, FINAL_EQUITY, FINAL_LEVERAGE, TOTAL_INVESTMENT

InviteRow = TypedDict(
    'InviteRow',
    {
        EMAIL_FIELD: str,
        FIRST_NAME_FIELD: str,
        LAST_NAME_FIELD: str,
        JOB_BAND_FIELD: str,
        DEPARTMENT_FIELD: str,
        OFFICE_LOCATION_FIELD: str,
        REGION_FIELD: str,
        MAX_LEVERAGE_FIELD: str,
        FINAL_EQUITY: Optional[str],
        FINAL_LEVERAGE: Optional[str],
        TOTAL_INVESTMENT: Optional[str],
    }
)
