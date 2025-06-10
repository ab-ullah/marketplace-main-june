from api.activities.models import TransactionDetail

TRANSACTION_DETAILS = [
    {
        "partner_id": "207462",
        "effective_date": "10/1/2021",
        "transaction_type": TransactionDetail.TransactionDetailType.INITIAL_COMMITMENT,
        "actual_transaction_amount": "1300000.00"
    },
    {
        "partner_id": "207388",
        "effective_date": "11/7/2021",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_LOAN,
        "actual_transaction_amount": "12999.99"
    },
    {
        "partner_id": "207390",
        "effective_date": "11/7/2021",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_BRIDGING_LOAN,
        "actual_transaction_amount": "3250.00"
    },
    {
        "partner_id": "207392",
        "effective_date": "11/30/2021",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION,
        "actual_transaction_amount": "3250.00"
    },
    {
        "partner_id": "207394",
        "effective_date": "11/30/2021",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_BRIDGING_LOAN,
        "actual_transaction_amount": "-3250.00"
    },
    {
        "partner_id": "207396",
        "effective_date": "12/31/2021",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "68.56"
    },
    {
        "partner_id": "207617",
        "effective_date": "1/31/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "35.88"
    },
    {
        "partner_id": "207618",
        "effective_date": "1/31/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "0.19"
    },
    {
        "partner_id": "207619",
        "effective_date": "1/31/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_INTEREST_REPAY_INCOME,
        "actual_transaction_amount": "104.63"
    },
    {
        "partner_id": "207620",
        "effective_date": "1/31/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_LOAN_REPAY_INCOME,
        "actual_transaction_amount": "707.87"
    },
    {
        "partner_id": "207621",
        "effective_date": "1/31/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_LOAN_REPAY_CAPITAL,
        "actual_transaction_amount": "1137.50"
    },
    {
        "partner_id": "207596",
        "effective_date": "3/31/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.FAIR_VALUE_ADJUSTMENT,
        "actual_transaction_amount": "2219.11"
    },
    {
        "partner_id": "207623",
        "effective_date": "3/31/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "58.6"
    },
    {
        "partner_id": "207814",
        "effective_date": "4/27/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_LOAN,
        "actual_transaction_amount": "27563.79"
    },
    {
        "partner_id": "207816",
        "effective_date": "4/27/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_BRIDGING_LOAN,
        "actual_transaction_amount": "6890.95"
    },
    {
        "partner_id": "207822",
        "effective_date": "5/15/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_LOAN,
        "actual_transaction_amount": "20409.92"
    },
    {
        "partner_id": "207824",
        "effective_date": "5/15/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_BRIDGING_LOAN,
        "actual_transaction_amount": "5102.48"
    },
    {
        "partner_id": "207818",
        "effective_date": "5/18/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION,
        "actual_transaction_amount": "6890.95"
    },
    {
        "partner_id": "207820",
        "effective_date": "5/18/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_BRIDGING_LOAN,
        "actual_transaction_amount": "-6890.95"
    },
    {
        "partner_id": "207826",
        "effective_date": "6/21/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION,
        "actual_transaction_amount": "5102.48"
    },
    {
        "partner_id": "207828",
        "effective_date": "6/21/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_BRIDGING_LOAN,
        "actual_transaction_amount": "-5102.48"
    },
    {
        "partner_id": "207840",
        "effective_date": "6/30/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "335.33"
    },
    {
        "partner_id": "207841",
        "effective_date": "6/30/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "0.47"
    },
    {
        "partner_id": "207862",
        "effective_date": "6/30/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.FAIR_VALUE_ADJUSTMENT,
        "actual_transaction_amount": "7659.09"
    },
    {
        "partner_id": "208400",
        "effective_date": "7/7/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_LOAN,
        "actual_transaction_amount": "19499.92"
    },
    {
        "partner_id": "208402",
        "effective_date": "7/7/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_BRIDGING_LOAN,
        "actual_transaction_amount": "4874.98"
    },
    {
        "partner_id": "208535",
        "effective_date": "7/25/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "164.61"
    },
    {
        "partner_id": "208536",
        "effective_date": "7/25/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "0.88"
    },
    {
        "partner_id": "208537",
        "effective_date": "7/25/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_INTEREST_REPAY_INCOME,
        "actual_transaction_amount": "559.89"
    },
    {
        "partner_id": "208538",
        "effective_date": "7/25/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_LOAN_REPAY_INCOME,
        "actual_transaction_amount": "2690.10"
    },
    {
        "partner_id": "209168",
        "effective_date": "7/30/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "33.81"
    },
    {
        "partner_id": "209170",
        "effective_date": "7/30/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_LOAN_REPAY_CAPITAL,
        "actual_transaction_amount": "1997.43"
    },
    {
        "partner_id": "209171",
        "effective_date": "7/30/2022",
        "transaction_type": 10,
        "actual_transaction_amount": "33.81"
    },
    {
        "partner_id": "208412",
        "effective_date": "8/4/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION_BRIDGING_LOAN,
        "actual_transaction_amount": "-4874.98"
    },
    {
        "partner_id": "208414",
        "effective_date": "8/4/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.CONTRIBUTION,
        "actual_transaction_amount": "4874.98"
    },
    {
        "partner_id": "209174",
        "effective_date": "9/30/2022",
        "transaction_type": TransactionDetail.TransactionDetailType.INTEREST,
        "actual_transaction_amount": "408.19"
    }
]