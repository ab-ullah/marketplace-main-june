import datetime
from typing import List


def get_date_after_n_working_days(start_date, add_days):
    business_days_to_add = add_days
    current_date = start_date
    while business_days_to_add > 0:
        current_date += datetime.timedelta(days=1)
        weekday = current_date.weekday()
        if weekday >= 5:
            continue
        business_days_to_add -= 1
    return current_date


def get_most_recent_dates(dates: List[datetime.date]):
    parsed_dates = [date for date in dates if date]
    if not parsed_dates:
        return None
    return max(parsed_dates)
