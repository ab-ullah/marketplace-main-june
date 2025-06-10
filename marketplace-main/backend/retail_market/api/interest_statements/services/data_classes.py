from dataclasses import dataclass
from datetime import date
from typing import Optional, List

from api.interest_statements.constants.precision import FLOAT_DECIMAL_PRECISION


@dataclass
class SegmentInfo:
    loan_balance: float
    brought_forward_interest: float
    from_date: date
    days: int = 0
    to_date: Optional[date] = None
    interest: float = 0


@dataclass
class QuarterInfo:
    year: int
    quarter: str
    total_interest: float
    segments: List[SegmentInfo]


@dataclass
class InterestDetail:
    brought_forward_interest: float
    quarter_start_interest: float
    running_interest: float
    paid_interest: float

    @staticmethod
    def normalize(amount):
        return round(float(amount), FLOAT_DECIMAL_PRECISION)

    def pay_interest(self, amount):
        amount = self.normalize(amount)
        self.paid_interest += amount
        self.brought_forward_interest = self.running_interest - self.paid_interest

    def set_brought_forward_interest(self, amount):
        self.brought_forward_interest = self.normalize(amount)

    def set_quarter_start_interest(self, amount):
        self.quarter_start_interest = self.normalize(amount)

    def add_running_interest(self, amount):
        self.running_interest += self.normalize(amount)

    def get_unpaid_interest(self):
        return self.running_interest - self.paid_interest
