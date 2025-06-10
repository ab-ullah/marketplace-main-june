from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from api.activities.constants.transaction_type_groups import TRANSACTION_GROUPS


@dataclass
class MergedTransaction:
    effective_date: date
    transaction_type: int
    actual_transaction_amount: Decimal
    is_interest_repay_transaction: bool
    is_loan_repay_transaction: bool
    is_contribution_loan_transaction: bool
    is_interest_transaction: bool


def are_same_type_transactions(t1, t2):
    if t1.effective_date != t2.effective_date:
        return False

    for transaction_group in TRANSACTION_GROUPS:
        if t1.transaction_type in transaction_group and t2.transaction_type in transaction_group:
            return True

    return False


def get_matching_transaction(merged_transactions, transaction):
    for merged_transaction in merged_transactions:
        if are_same_type_transactions(merged_transaction, transaction):
            return merged_transaction


def merge_transactions(transactions):
    merged_transactions = []
    for transaction in transactions:
        if not transaction.is_acceptable_transaction():
            continue
        merged_transaction = MergedTransaction(
            effective_date=transaction.effective_date,
            transaction_type=transaction.transaction_type,
            actual_transaction_amount=transaction.actual_transaction_amount,
            is_interest_repay_transaction=transaction.is_interest_repay_transaction(),
            is_loan_repay_transaction=transaction.is_loan_repay_transaction(),
            is_contribution_loan_transaction=transaction.is_contribution_loan_transaction(),
            is_interest_transaction=transaction.is_interest_transaction(),
        )
        if not merged_transactions:
            merged_transactions.append(merged_transaction)
            continue
        matching_transaction = get_matching_transaction(
            merged_transactions=merged_transactions,
            transaction=transaction
        )
        if not matching_transaction:
            merged_transactions.append(merged_transaction)
        else:
            matching_transaction.actual_transaction_amount += transaction.actual_transaction_amount

    return merged_transactions
