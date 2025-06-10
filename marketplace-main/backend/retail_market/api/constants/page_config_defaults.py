INVESTOR_DASHBOARD_CONFIG = {
    "active_investments_label": "Active Investments",
    "legacy_investments_label": "Legacy Program Investments",
    "chart_stats_heading": "Total Gross Share of NAV Breakdown",
    "page_headline": "All metrics are based on the most recent data provided.<br/> This means aggregate data is totaled across investments with different data reporting dates.<br/> Aggregate data does not include Legacy Program Investments.",
    "tiles": [
        {
            "id": 0,
            "heading": "Total Equity",
            "field_name": "equity_commitment",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Equity Commitment",
                "description": "Equity obligation by investor to the investment."
            }
        },
        {
            "id": 1,
            "heading": "Total Equity Commitment Called to Date",
            "field_name": "equity_called",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Equity Commitment Called to Date",
                "description": "Amount of legal equity with respect to an investment which has been drawn from investor"
            }
        },
        {
            "id": 2,
            "heading": "Distributions to Date",
            "field_name": "total_distributions",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Distributions from Underlying Investment",
                "description": "Return of capital and profit distributions from underlying fund into the feeder/program attributable to the employee"
            }
        },
        {
            "id": 3,
            "heading": "Total Unrealized Gain/(Loss)",
            "field_name": "gain",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Total Unrealized Gain/(Loss)",
                "description": "Valuation less cost basis across all active investments"
            }
        },
        {
            "id": 4,
            "heading": "Total Loan",
            "field_name": "loan_commitment",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Loan Commitment",
                "description": "Total attributable loan commitment to an investment"
            }
        },
        {
            "id": 5,
            "heading": "Total Loan Balance + Unpaid Interest",
            "field_name": "loan_balance_with_unpaid_interest",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Total Loan Balance + Unpaid Interest",
                "description": "Total balance of attributable loans provided plus the balance of interest due across all investments."
            }
        },
        {
            "id": 6,
            "heading": "Total Net Equity",
            "field_name": "current_net_equity",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Total Net Equity",
                "description": "NAV of the investor portfolio net of the employee's attributable share of total unpaid loans and interest across all investments. It is adjusted to include capital calls since latest published NAV, less distributions since latest published NAV."
            }
        },

        {
            "id": 7,
            "heading": "Total IRR Leveraged / Unleveraged",
            "field_name": "total_leveraged_unleveraged_irr",
            "enabled": True,
            "default_value": "Coming Soon",
            "field_type": "string",
            "tooltip": {
                "heading": "Total IRR Leveraged / Unleveraged",
                "description": "Coming Soon"
            }
        }
    ],
    "right_section_stats": [
        {
            "id": 0,
            "heading": "Total Equity Commitment Called to Date",
            "field_name": "equity_called",
            "enabled": True,
            "field_type": "currency",
            "color": "#AD62AA"
        },
        {
            "id": 1,
            "heading": "Total Unrealized Gain/(Loss)",
            "field_name": "gain",
            "enabled": True,
            "field_type": "currency",
            "color": "#4A47A3"
        },
        {
            "id": 2,
            "heading": "Total Unpaid Interest",
            "field_name": "unpaid_interest",
            "enabled": True,
            "field_type": "currency",
            "color": "#610094"
        },
        {
            "id": 3,
            "heading": "Total Loan Balance",
            "field_name": "loan_balance",
            "enabled": True,
            "field_type": "currency",
            "color": "#03145E"
        },

    ],
    "tables": [
        {
            "heading": "Active Investments",
            "rows": [
                {
                    "id": 0,
                    "heading": "Investment",
                    "field_name": "fund_name",
                    "enabled": True,
                    "field_type": "string",
                    "link_to_investment_detail": True,
                    "is_sortable": False,
                    "tooltip": {
                        "heading": "Investment",
                        "description": "The fund, separate account mandate or other investment that the employee is investing in."
                    }
                },
                {
                    "id": 1,
                    "heading": "Equity",
                    "field_name": "equity_commitment",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Equity Commitment",
                        "description": "Equity obligation by investor to the investment."
                    }
                },
                {
                    "id": 2,
                    "heading": "Equity Commitment Called to Date",
                    "field_name": "equity_called",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Equity Commitment Called to Date",
                        "description": "Amount of legal equity with respect to an investment which has been drawn from investor"
                    }
                },
                {
                    "id": 3,
                    "heading": "Loan",
                    "field_name": "loan_commitment",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Loan Commitment",
                        "description": "Total attributable loan commitment to an investment"
                    }
                },
                {
                    "id": 4,
                    "heading": "Loan Balance + Unpaid Interest",
                    "field_name": "loan_balance_with_unpaid_interest",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "tooltip": {
                        "heading": "Loan Balance + Unpaid Interest",
                        "description": "Balance of attributable loan provided plus the balance of interest due."
                    }
                },
                {
                    "id": 5,
                    "heading": "Distributions to Date",
                    "field_name": "total_distributions",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "tooltip": {
                        "heading": "Distributions from Underlying Investment",
                        "description": "Return of capital and profit distributions from underlying fund into the feeder/program attributable to the employee"
                    }
                },

                {
                    "id": 6,
                    "heading": "Unrealized Gain/(Loss)",
                    "field_name": "gain",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "hideForLegacy": True,
                    "tooltip": {
                        "heading": "Unrealized Gain/(Loss)",
                        "description": "Valuation of investment less cost basis of investment."
                    }
                },
                {
                    "id": 7,
                    "heading": "Gross Share of NAV",
                    "field_name": "nav_share",
                    "field_type": "currency",
                    "enabled": True,
                    "is_sortable": True,
                    "tooltip": {
                        "heading": "Gross Share of NAV",
                        "description": "Investor's share of Investment NAV. It is adjusted to include capital calls since latest published NAV, less distributions since latest published NAV"
                    }
                },
                {
                    "id": 8,
                    "heading": "Net Equity",
                    "field_name": "current_net_equity",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Net Equity",
                        "description": "NAV of the Investment attributable to the employee net of the employee's attributable share of unpaid loans and interest"
                    }
                },
                {
                    "id": 9,
                    "heading": "Last NAV Update",
                    "field_name": "latest_nav",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "date",
                    "tooltip": {}
                },
                {
                    "id": 10,
                    "heading": "IRR (Leveraged)",
                    "field_name": "leveraged_irr",
                    "hideForLegacy": True,
                    "enabled": True,
                    "isLeverageField": True,
                    "is_sortable": True,
                    "field_type": "percentage",
                    "tooltip": {
                        "heading": "IRR Leveraged",
                        "description": "Coming Soon"
                    }
                },
                {
                    "id": 11,
                    "heading": "IRR (Unleveraged)",
                    "field_name": "un_leveraged_irr",
                    "hideForLegacy": True,
                    "enabled": True,
                    "isLeverageField": True,
                    "field_type": "percentage",
                    "is_sortable": True,
                    "tooltip": {
                        "heading": "IRR Unleveraged",
                        "description": "Coming Soon"
                    }
                },

                {
                    "id": 12,
                    "heading": "Currency",
                    "field_name": "currency_code",
                    "enabled": True,
                    "field_type": "string",
                    "is_sortable": True,
                    "tooltip": {
                        "heading": "Currency",
                        "description": "Currency of the investment"
                    }
                }
            ]
        }
    ]
}

INVESTMENT_DETAIL_PAGE_CONFIG = {
    "tiles": [
        {
            "id": 0,
            "heading": "Net Equity",
            "field_name": "current_net_equity",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Net Equity",
                "description": "NAV of the Investment attributable to the employee net of the employee's attributable share of unpaid loans and interest"
            }
        },
        {
            "id": 1,
            "heading": "Loan Balance + Unpaid Interest",
            "field_name": "loan_balance_with_unpaid_interest",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Loan Balance + Unpaid Interest",
                "description": "Balance of attributable loan provided plus the balance of interest due."
            }
        },
        {
            "id": 2,
            "heading": "Gross Share Of NAV",
            "field_name": "gross_share_of_investment_product",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Gross Share Of NAV",
                "description": "Investor's share of Investment NAV. It is adjusted to include capital calls since latest published NAV, less distributions since latest published NAV"
            }
        },
        {
            "id": 3,
            "heading": "Equity Commitment Uncalled",
            "field_name": "remaining_equity",
            "enabled": True,
            "field_type": "currency",
            "tooltip": {
                "heading": "Equity Commitment Uncalled",
                "description": "Uncalled equity investor has committed towards the investment"
            }
        },
        {
            "id": 4,
            "heading": "Unrealized Gain/(Loss)",
            "field_name": "gain",
            "enabled": True,
            "field_type": "currency",
            "hideForLegacy": True,
            "tooltip": {
                "heading": "Unrealized Gain/(Loss)",
                "description": "Valuation of investment less cost basis of investment."
            }
        },
        {
            "id": 5,
            "heading": "IRR Leveraged / Unleveraged",
            "field_name": "leveraged_unleveraged_irr",
            "hideForLegacy": True,
            "isLeverageField": True,
            "enabled": True,
            "default_value": "Coming Soon",
            "field_type": "percentage",
            "tooltip": {
                "heading": "IRR Leveraged / Unleveraged",
                "description": "Coming Soon"
            }
        }
    ],
    "tables": [{
        "heading": "Gross Commitments",
        "enabled": True,

        "rows": [
            {
                "id": 0,
                "heading": "Gross Commitment",
                "field_name": "commitment_amount",
                "enabled": True,
                "field_type": "currency",
                "tooltip": {
                    "heading": "Gross Commitment",
                    "description": "Investor's total attributable commitment to an investment, including the amount to be funded via loan "
                }
            },
            {
                "id": 1,
                "heading": "Gross Commitment Called to Date",
                "field_name": "called_to_date",
                "enabled": True,
                "field_type": "currency",
                "tooltip": {
                    "heading": "Gross Commitment Called to Date",
                    "description": "Total amount of legal equity and attributable loan drawn from investor since inception."
                }
            },
            {
                "id": 2,
                "heading": "Gross Commitment Uncalled",
                "field_name": "uncalled_amount",
                "enabled": True,
                "field_type": "currency",
                "tooltip": {
                    "heading": "Gross Commitment Uncalled",
                    "description": "Investor's remaining attributable commitment to an investment, including both the amount to be funded via equity and attributable loan"
                }
            },
            {
                "id": 3,
                "heading": "Gross Distributions Recallable to Date",
                "field_name": "gross_distributions_recallable_to_date",
                "enabled": True,
                "hideForLegacy": True,
                "field_type": "currency",
                "tooltip": {
                    "heading": "Gross Distributions Recallable to Date",
                    "description": "Total amount of capital returned by the investment to the investor that can be used for future capital calls during the investment period."
                }
            },
            {
                "id": 4,
                "heading": "Net Commitment Called to Date",
                "field_name": "net_commitment_called_to_date",
                "enabled": True,
                "hideForLegacy": True,
                "field_type": "currency",
                "tooltip": {
                    "heading": "Net Commitment Called to Date",
                    "description": "Total amount of legal equity and attributable loan contributions less amount of capital returned by investment that can be used for future capital calls during the investment period."
                }
            }
        ]
    },
        {
            "heading": "Loans",
            "enabled": True,
            "rows": [
                {
                    "id": 0,
                    "heading": "Loan Commitment",
                    "field_name": "loan_commitment",
                    "enabled": True,
                    "field_type": "currency",
                    "depends_on_field": "initial_leverage_ratio",
                    "depended_field_default": '-',
                    "tooltip": {
                        "heading": "Loan Commitment",
                        "description": "Total attributable loan commitment to an investment"
                    }
                },
                {
                    "id": 1,
                    "heading": "Interest Rate",
                    "field_name": "current_interest_rate",
                    "enabled": True,
                    "field_type": "percentage",
                    "depends_on_field": "initial_leverage_ratio",
                    "depended_field_default": '-',
                    "tooltip": {
                        "heading": "Interest Rate",
                        "description": "The latest annually determined interest rate for the loan."
                    }
                },
                {
                    "id": 2,
                    "heading": "Loan Drawn",
                    "field_name": "loan_drawn",
                    "enabled": True,
                    "hideForLegacy": True,
                    "field_type": "currency",
                    "depends_on_field": "initial_leverage_ratio",
                    "depended_field_default": '-',
                    "tooltip": {
                        "heading": "Loan Drawn",
                        "description": "The amount of the loan commitment that has been called by the manager."
                    }
                },
                {
                    "id": 3,
                    "heading": "Total Interest Accrued to Date",
                    "field_name": "interest_accrued",
                    "enabled": True,
                    "field_type": "currency",
                    "depends_on_field": "initial_leverage_ratio",
                    "depended_field_default": '-',
                    "tooltip": {
                        "heading": "Total Interest Accrued to Date",
                        "description": "The total amount of interest payable on attributable loans since inception."
                    }
                },
                {
                    "id": 4,
                    "heading": "Loan Repayment",
                    "field_name": "loan_repayment",
                    "enabled": True,
                    "field_type": "currency",
                    "depends_on_field": "initial_leverage_ratio",
                    "depended_field_default": '-',
                    "tooltip": {
                        "heading": "Loan Repayment",
                        "description": "The amount of the drawn loan that has been repaid by the investor."
                    }
                },
                {
                    "id": 5,
                    "heading": "Total Interest Paid to Date",
                    "field_name": "interest_paid",
                    "depends_on_field": "initial_leverage_ratio",
                    "depended_field_default": '-',
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Total Interest Paid to Date",
                        "description": "Total amount of interest paid on attributable loans with respect to the investment."
                    }
                },
                {
                    "id": 6,
                    "heading": "Loan Balance + Unpaid Interest",
                    "field_name": "loan_balance_with_unpaid_interest",
                    "depends_on_field": "initial_leverage_ratio",
                    "depended_field_default": '-',
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Loan Balance + Unpaid Interest",
                        "description": "Balance of attributable loan provided plus the balance of interest due."
                    }
                },
                {
                    "id": 7,
                    "heading": "Loan to Value",
                    "field_name": "loan_to_value",
                    "enabled": True,
                    "field_type": "percentage",
                    "depends_on_field": "initial_leverage_ratio",
                    "depended_field_default": '-',
                    "tooltip": {
                        "heading": "Loan to Value",
                        "description": "The value of leverage for the investment divided by the gross share of NAV."
                    }
                },
                {
                    "id": 8,
                    "heading": "Initial Leverage Ratio",
                    "field_name": "initial_leverage_ratio",
                    "enabled": True,
                    "field_type": "percentage",
                    "tooltip": {
                        "heading": "Initial Leverage Ratio",
                        "description": "The loan to value for the investment at the time of subscription"
                    }
                }
            ]
        },
        {
            "heading": "Equity",
            "enabled": True,
            "rows": [
                {
                    "id": 0,
                    "heading": "Equity Commitment",
                    "field_name": "equity_commitment",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Equity Commitment",
                        "description": "Equity obligation by investor to the investment."
                    }
                },
                {
                    "id": 1,
                    "heading": "Equity Commitment Called to Date",
                    "field_name": "equity_called",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Equity Commitment Called to Date",
                        "description": "Amount of legal equity with respect to an investment which has been drawn from investor"
                    }
                },
                {
                    "id": 2,
                    "heading": "Equity Commitment Uncalled",
                    "field_name": "equity_remaining",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Equity Commitment Uncalled",
                        "description": "Uncalled equity investor has committed towards the investment"
                    }
                }
            ]
        },
        {
            "heading": "Distributions",
            "enabled": True,
            "hideForLegacy": True,
            "rows": [
                {
                    "id": 0,
                    "heading": "Distributions from Underlying Investment",
                    "field_name": "total_distributions",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Distributions from Underlying Investment",
                        "description": "Return of capital and profit distributions from underlying fund into the feeder/program attributable to the employee"
                    }
                },
                {
                    "id": 1,
                    "heading": "Distributions Used to Repay Loan",
                    "field_name": "distributions_used_for_loan",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Distributions Used to Repay Loan",
                        "description": "Distribution proceeds that have been used to reduce the balance of the employee's attributable loan."
                    }
                },
                {
                    "id": 2,
                    "heading": "Distributions Used to Repay Interest",
                    "field_name": "distributions_used_for_interest",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Distributions Used to Repay Interest",
                        "description": "Investment distribution proceeds that have been used to reduce the balance of the employee's interest expense over the life of the investment."
                    }
                },
                {
                    "id": 3,
                    "heading": "Distributions Recallable",
                    "field_name": "distributions_recallable",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Distributions Recallable",
                        "description": "Investment distributions that are able to be called again by the manager for purposes of investing."
                    }
                },
                {
                    "id": 4,
                    "heading": "Distributions Paid to Employee",
                    "field_name": "distributions_to_employee",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Distributions Paid to Employee",
                        "description": "Amount distributed to employee."
                    }
                }
            ]
        },
        {
            "heading": "NAV",
            "enabled": True,
            "hide_if_field": "is_nav_disabled",
            "rows": [
                {
                    "id": 0,
                    "heading": "Investment NAV",
                    "field_name": "fund_nav",
                    "field_type": "currency",
                    "enabled": True,
                    "tooltip": {
                        "heading": "Investment NAV",
                        "description": "The latest available NAV of the underlying investment."
                    }
                },
                {
                    "id": 1,
                    "heading": "Investment NAV as of",
                    "field_name": "fund_nav_date",
                    "field_type": "date",
                    "enabled": True,
                    "tooltip": {
                        "heading": "Investment NAV as of (date)",
                        "description": "Date of the investment NAV shown in the investor portal."
                    }
                },
                {
                    "id": 2,
                    "heading": "Investment Ownership %",
                    "field_name": "fund_ownership_percent",
                    "field_type": "percentage",
                    "enabled": True,
                    "tooltip": {
                        "heading": "Investment Ownership %",
                        "description": "The ownership percentage of an investor in an investment"
                    }
                },
                {
                    "id": 3,
                    "heading": "Gross Share of NAV",
                    "field_name": "gross_share_of_investment_product",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Gross Share of NAV",
                        "description": "Investor's share of Investment NAV. It is adjusted to include capital calls since latest published NAV, less distributions since latest published NAV"
                    }
                },
                {
                    "id": 4,
                    "heading": "Loan Balance + Unpaid Interest",
                    "field_name": "loan_balance_with_unpaid_interest",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Loan Balance + Unpaid Interest",
                        "description": "Balance of attributable loan provided plus the balance of interest due."
                    }
                },
                {
                    "id": 5,
                    "heading": "Capital Calls Since Last NAV Update",
                    "field_name": "capital_calls_since_last_nav",
                    "hideForLegacy": True,
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Capital Calls Since Last NAV Update",
                        "description": "Total capital called by the investment from the investor since the last reported NAV of the investment"
                    }
                },
                {
                    "id": 6,
                    "heading": "Distributions Since Last NAV Update",
                    "field_name": "distributions_calls_since_last_nav",
                    "enabled": True,
                    "field_type": "currency",
                    "hideForLegacy": True,
                    "tooltip": {
                        "heading": "Distributions Since Last NAV Update",
                        "description": "Total distributions from the investment to the investor made since the last reported NAV of the investment."
                    }
                },
                {
                    "id": 7,
                    "heading": "Net Equity",
                    "field_name": "current_net_equity",
                    "enabled": True,
                    "field_type": "currency",
                    "tooltip": {
                        "heading": "Net Equity",
                        "description": "NAV of the Investment attributable to the employee net of the employee's attributable share of unpaid loans and interest"
                    }
                },
                {
                    "id": 8,
                    "heading": "Unrealized Gain/(Loss)",
                    "field_name": "gain",
                    "hideForLegacy": True,
                    "field_type": "currency",
                    "enabled": True,
                    "tooltip": {
                        "heading": "Unrealized Gain/(Loss)",
                        "description": "Valuation of investment less cost basis of investment."
                    }
                }
            ]
        }
    ]
}

NOTICE_CONSIDERATIONS_CONFIG = {
    "transactional_considerations_label": "Transactional Investments",
    "tax_considerations_label": "Tax Investments",
    "valuation_considerations_label": "Valuation Investments",
    "page_headline": "Metrics are based on the most recent data provided.<br/> Aggregate data is totaled across investments with different data reporting dates.",
    "tiles": [
        {
            "id": 0,
            "heading": "Total Income Reported",
            "field_name": "total_taxable",
            "enabled": True,
            "field_type": "currency",
        },
        {
            "id": 1,
            "heading": "Return of Capital",
            "field_name": "non_taxable",
            "enabled": True,
            "field_type": "currency",
        },
        {
            "id": 2,
            "heading": "Character Unreported",
            "field_name": "character_unknown",
            "enabled": True,
            "field_type": "currency",
        },
        {
            "id": 3,
            "heading": "Portfolio Value",
            "field_name": "net_asset_value_usd",
            "enabled": True,
            "field_type": "currency",
            "tile_type": "valuation"
        },
        {
            "id": 4,
            "heading": "Total Unfunded Commitment",
            "field_name": "unfunded_commitment_usd",
            "enabled": True,
            "field_type": "currency",
            "tile_type": "valuation"
        },
        {
            "id": 5,
            "heading": "Total Capital Invested",
            "field_name": "capital_called",
            "enabled": True,
            "field_type": "currency",
            "tile_type": "valuation"
        },

    ],
    "tables": [
        {
            "heading": "Taxable Income Summary",
            "id": "tax",
            "rows": [
                # {
                #     "id": 0,
                #     "heading": "Fund/Manager",
                #     "field_name": "fund_name",
                #     "enabled": True,
                #     "field_type": "string",
                #     # "link_to_investment_detail": True,
                #     "is_sortable": True,
                # },
                {
                    "id": 1,
                    "heading": "Fund/Manager",
                    "field_name": "firm_name",
                    "enabled": True,
                    "is_sortable": False,
                    "field_type": "string",
                    "link_to_investment_detail": True,
                    "minWidth": 130
                },
                {
                    "id": 2,
                    "heading": "Notice Date",
                    "field_name": "notice_date",
                    "enabled": True,
                    "is_sortable": False,
                    "field_type": "date",
                    "minWidth": 60
                },
                {
                    "id": 3,
                    "heading": "Quarter",
                    "field_name": "quarter",
                    "enabled": True,
                    # "is_sortable": True,
                    "field_type": "string",
                    "minWidth": 40
                },
                {
                    "id": 4,
                    "heading": "Return of Capital",
                    "field_name": "non_taxable",
                    "enabled": True,
                    "is_sortable": False,
                    "field_type": "currency",
                    "minWidth": 80
                },
                {
                    "id": 5,
                    "heading": "Total Income Reported",
                    "field_name": "total_taxable",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "minWidth": 90
                },
                {
                    "id": 6,
                    "heading": "Long Term Capital Gain",
                    "field_name": "ltcg",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 100
                },
                {
                    "id": 7,
                    "heading": "Short Term Capital Gain",
                    "field_name": "stcg",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 100
                },

                {
                    "id": 8,
                    "heading": "Ordinary Income/Interest Income",
                    "field_name": "ordinary",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 9,
                    "heading": "Dividend Income",
                    "field_name": "dividend",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": False,
                    "minWidth": 60
                },
                {
                    "id": 10,
                    "heading": "Character Unreported",
                    "field_name": "character_unknown",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": False,
                    "tooltip": {
                        "heading": "Character Unreported",
                        "description": "Tax character not reported in original notice."
                    },
                    "minWidth": 100
                },
                {
                    "id": 11,
                    "heading": "Currency",
                    "field_name": "currency_code",
                    "enabled": True,
                    "field_type": "string",
                    "minWidth": 30
                }
            ]
        },
        {
            "heading": "Transactional Summary",
            "id": "transactional",
            "rows": [
                # {
                #     "id": 0,
                #     "heading": "Fund/Manager",
                #     "field_name": "fund_name",
                #     "enabled": True,
                #     "field_type": "string",
                #     # "link_to_investment_detail": True,
                #     "is_sortable": True,
                # },
                {
                    "id": 0,
                    "heading": "Fund/Manager",
                    "field_name": "firm_name",
                    "enabled": True,
                    "is_sortable": False,
                    "field_type": "string",
                    "link_to_investment_detail": True,
                    "minWidth": 130
                },
                {
                    "id": 2,
                    "heading": "Notice Date",
                    "field_name": "notice_date",
                    "enabled": True,
                    "is_sortable": False,
                    "field_type": "date",
                    "minWidth": 100
                },
                {
                    "id": 3,
                    "heading": "Quarter",
                    "field_name": "quarter",
                    "enabled": True,
                    # "is_sortable": True,
                    "field_type": "string",
                    "minWidth": 80
                },
                {
                    "id": 4,
                    "heading": "Capital Invested",
                    "field_name": "capital_called",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "minWidth": 130
                },
                {
                    "id": 5,
                    "heading": "Capital Distributed",
                    "field_name": "distributed",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 90
                },
                {
                    "id": 6,
                    "heading": "Other Activity",
                    "field_name": "other_activity",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 110
                },

                {
                    "id": 7,
                    "heading": "Net Transaction",
                    "field_name": "net_transaction",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 8,
                    "heading": "Currency",
                    "field_name": "currency_code",
                    "enabled": True,
                    "field_type": "string",
                    "minWidth": 80

                }
            ]
        },
        {
            "heading": "Aggregated Portfolio Value",
            "id": "valuation",
            "rows": [
                {
                    "id": 1,
                    "heading": "Fund/Manager",
                    "field_name": "firm_name",
                    "enabled": True,
                    "is_sortable": False,
                    "field_type": "string",
                    "link_to_investment_detail": True,
                    "minWidth": 130
                },
                {
                    "id": 2,
                    "heading": "Notice Date",
                    "field_name": "notice_date",
                    "enabled": True,
                    # "is_sortable": True,
                    "field_type": "date",
                    "minWidth": 80
                },
                {
                    "id": 3,
                    "heading": "Reported Fair Market Value",
                    "field_name": "reported_fair_market_value",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "minWidth": 110
                },
                {
                    "id": 4,
                    "heading": "+/(-) Leverage or Lines of Credit",
                    "field_name": "leverage_fund_line",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 5,
                    "heading": "Portfolio Value",
                    "field_name": "net_asset_value",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 120
                },

                {
                    "id": 6,
                    "heading": "Adjusting Values",
                    "field_name": "adjusted_values",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 7,
                    "heading": "Portfolio Value (USD)",
                    "field_name": "net_asset_value_usd",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 120
                },
                {
                    "id": 8,
                    "heading": "Est. or Reported Unfunded",
                    "field_name": "reported_unfunded",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 9,
                    "heading": "Unfunded Commitment",
                    "field_name": "unfunded_commitment",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 110
                },
                {
                    "id": 10,
                    "heading": "Unfunded Commitment (USD)",
                    "field_name": "unfunded_commitment_usd",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 110
                },
                {
                    "id": 11,
                    "heading": "Currency",
                    "field_name": "currency_code",
                    "enabled": True,
                    "field_type": "string",
                    "minWidth": 80

                }
            ]
        },
    ]
}

NOTICE_CONSIDERATIONS_FIRM_DETAIL_CONFIG = {
    "tiles": [
        {
            "id": 0,
            "heading": "Total Income Reported",
            "field_name": "total_taxable",
            "enabled": True,
            "field_type": "currency",
        },
        {
            "id": 1,
            "heading": "Return of Capital",
            "field_name": "non_taxable",
            "enabled": True,
            "field_type": "currency",
        },
        {
            "id": 2,
            "heading": "Character Unreported",
            "field_name": "character_unknown",
            "enabled": True,
            "field_type": "currency",
        },
        {
            "id": 3,
            "heading": "Portfolio Value",
            "field_name": "net_asset_value_usd",
            "enabled": True,
            "field_type": "currency",
            "tile_type": "valuation"
        },
        {
            "id": 4,
            "heading": "Total Unfunded Commitment",
            "field_name": "unfunded_commitment_usd",
            "enabled": True,
            "field_type": "currency",
            "tile_type": "valuation"
        },
        {
            "id": 5,
            "heading": "Total Capital Invested",
            "field_name": "capital_called",
            "enabled": True,
            "field_type": "currency",
            "tile_type": "valuation"
        },

    ],
    "tables": [
        {
            "heading": "Taxable Income Summary",
            "rows": [
                {
                    "id": 0,
                    "heading": "Fund/Manager",
                    "field_name": "fund_name",
                    "enabled": True,
                    "field_type": "string",
                    # "link_to_investment_detail": True,
                    "is_sortable": False,
                    "minWidth": 130
                },

                {
                    "id": 1,
                    "heading": "Notice Date",
                    "field_name": "notice_date",
                    "enabled": True,
                    "is_sortable": False,
                    "field_type": "date",
                    "minWidth": 100
                },
                {
                    "id": 2,
                    "heading": "Quarter",
                    "field_name": "quarter",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "string",
                    "minWidth": 80
                },
                {
                    "id": 3,
                    "heading": "Return of Capital",
                    "field_name": "non_taxable",
                    "enabled": True,
                    "is_sortable": False,
                    "field_type": "currency",
                    "minWidth": 130
                },
                {
                    "id": 4,
                    "heading": "Total Income Reported",
                    "field_name": "total_taxable",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "minWidth": 110
                },
                {
                    "id": 5,
                    "heading": "Long Term Capital Gain",
                    "field_name": "ltcg",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 100
                },
                {
                    "id": 6,
                    "heading": "Short Term Capital Gain",
                    "field_name": "stcg",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 100
                },

                {
                    "id": 7,
                    "heading": "Ordinary Income/Interest Income",
                    "field_name": "ordinary",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 6,
                    "heading": "Dividend Income",
                    "field_name": "dividend",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": False,
                    "minWidth": 130
                },
                {
                    "id": 8,
                    "heading": "Character Unreported",
                    "field_name": "character_unknown",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": False,
                    "tooltip": {
                        "heading": "Character Unreported",
                        "description": "Tax character not reported in original notice."
                    },
                    "minWidth": 100
                },
                {
                    "id": 9,
                    "heading": "Currency",
                    "field_name": "currency_code",
                    "enabled": True,
                    "field_type": "string",
                    "minWidth": 80
                }
            ]
        },
        {
            "heading": "Transactional Summary",
            "rows": [
                {
                    "id": 0,
                    "heading": "Fund/Manager",
                    "field_name": "fund_name",
                    "enabled": True,
                    "field_type": "string",
                    # "link_to_investment_detail": True,
                    "is_sortable": False,
                    "minWidth": 130
                },

                {
                    "id": 1,
                    "heading": "Notice Date",
                    "field_name": "notice_date",
                    "enabled": True,
                    "is_sortable": False,
                    "field_type": "date",
                    "minWidth": 100
                },
                {
                    "id": 2,
                    "heading": "Quarter",
                    "field_name": "quarter",
                    "enabled": True,
                    # "is_sortable": True,
                    "field_type": "string",
                    "minWidth": 80
                },
                {
                    "id": 3,
                    "heading": "Capital Invested",
                    "field_name": "capital_called",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "minWidth": 130
                },
                {
                    "id": 4,
                    "heading": "Capital Distributed",
                    "field_name": "distributed",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 90
                },
                {
                    "id": 5,
                    "heading": "Other Activity",
                    "field_name": "other_activity",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 110
                },

                {
                    "id": 6,
                    "heading": "Net Transaction",
                    "field_name": "net_transaction",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 7,
                    "heading": "Currency",
                    "field_name": "currency_code",
                    "enabled": True,
                    "field_type": "string",
                    "minWidth": 80
                }
            ]
        },
        {
            "heading": "Aggregated Portfolio Value",
            "id": "valuation",
            "rows": [
                {
                    "id": 1,
                    "heading": "Fund/Manager",
                    "field_name": "fund_name",
                    "enabled": True,
                    "field_type": "string",
                    "is_sortable": False,
                    "minWidth": 130
                },
                {
                    "id": 2,
                    "heading": "Notice Date",
                    "field_name": "notice_date",
                    "enabled": True,
                    # "is_sortable": True,
                    "field_type": "date",
                    "minWidth": 80
                },
                {
                    "id": 3,
                    "heading": "Reported Fair Market Value",
                    "field_name": "reported_fair_market_value",
                    "enabled": True,
                    "is_sortable": True,
                    "field_type": "currency",
                    "minWidth": 110
                },
                {
                    "id": 4,
                    "heading": "+/(-) Leverage or Lines of Credit",
                    "field_name": "leverage_fund_line",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 5,
                    "heading": "Net Asset Value",
                    "field_name": "net_asset_value",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },

                {
                    "id": 6,
                    "heading": "Adjusting Values",
                    "field_name": "adjusted_values",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 7,
                    "heading": "Net Asset Value (USD)",
                    "field_name": "net_asset_value_usd",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 8,
                    "heading": "Est. or Reported Unfunded",
                    "field_name": "reported_unfunded",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 130
                },
                {
                    "id": 9,
                    "heading": "Unfunded Commitment",
                    "field_name": "unfunded_commitment",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 110
                },
                {
                    "id": 10,
                    "heading": "Unfunded Commitment (USD)",
                    "field_name": "unfunded_commitment_usd",
                    "enabled": True,
                    "field_type": "currency",
                    "is_sortable": True,
                    "minWidth": 110
                },
                {
                    "id": 11,
                    "heading": "Currency",
                    "field_name": "currency_code",
                    "enabled": True,
                    "field_type": "string",
                    "minWidth": 80
                }
            ]
        }
    ]
}
