import datetime
from datetime import date, datetime
from typing import Union


class DateUtil:

    @staticmethod
    def get_days_for_year(period_start):
        year = period_start.year
        start = date(year, 1, 1)
        end = date(year, 12, 31)
        diff = (end - start) + datetime.timedelta(days=1)
        return diff.days

    @staticmethod
    def is_quarter_end(for_date):
        year = for_date.year
        q1 = date(year, 3, 31)
        q2 = date(year, 6, 30)
        q3 = date(year, 9, 30)
        q4 = date(year, 12, 31)

        if for_date == q1 or for_date == q2 or for_date == q3 or for_date == q4:
            return True

        return False

    @staticmethod
    def is_quarter_start(for_date):
        year = for_date.year
        q1 = date(year, 1, 1)
        q2 = date(year, 4, 1)
        q3 = date(year, 7, 1)
        q4 = date(year, 10, 1)

        if for_date == q1 or for_date == q2 or for_date == q3 or for_date == q4:
            return True

        return False

    @staticmethod
    def start_of_quarter(for_date):
        year = for_date.year
        q1 = date(year, 1, 1)
        q2 = date(year, 4, 1)
        q3 = date(year, 7, 1)
        q4 = date(year, 10, 1)

        if for_date > q4:
            return q4

        if for_date > q3:
            return q3

        if for_date > q2:
            return q2

        return q1

    @staticmethod
    def end_of_quarter(for_date):
        year = for_date.year
        q1 = date(year, 3, 31)
        q2 = date(year, 6, 30)
        q3 = date(year, 9, 30)
        q4 = date(year, 12, 31)

        if for_date < q1:
            return q1

        if for_date < q2:
            return q2

        if for_date < q3:
            return q3

        return q4

    @staticmethod
    def get_quarter_name(for_date):
        quarter = 'Q4'
        quarter_end_date = DateUtil.closest_nxt_qrtr_end_date(for_date)

        year = quarter_end_date.year
        q1 = date(year, 3, 31)
        q2 = date(year, 6, 30)
        q3 = date(year, 9, 30)
        q4 = date(year, 12, 31)

        if quarter_end_date == q1:
            quarter = 'Q1'

        if quarter_end_date == q2:
            quarter = 'Q2'

        if quarter_end_date == q3:
            quarter = 'Q3'

        return '{} {}'.format(quarter, year)

    @staticmethod
    def closest_nxt_qrtr_end_date(for_date: Union[date, datetime]) -> date:
        year = for_date.year
        quarter_end_dates = [
            date(year, 3, 31),
            date(year, 6, 30),
            date(year, 9, 30),
            date(year, 12, 31)
        ]

        min_days_difference = 365
        closest_quarter_end_date = None
        pure_for_date = date(for_date.year, for_date.month, for_date.day)
        for quarter_end_date in quarter_end_dates:
            if quarter_end_date >= pure_for_date:
                days_difference = (quarter_end_date - pure_for_date).days
                if days_difference < min_days_difference:
                    min_days_difference = days_difference
                    closest_quarter_end_date = quarter_end_date

        return closest_quarter_end_date
