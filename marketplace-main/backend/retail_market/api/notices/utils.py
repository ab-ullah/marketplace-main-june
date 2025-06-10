from dateutil import parser


def get_quarter(date):
    date = parser.parse(date)
    month = date.month
    if month in [1, 2, 3]:
        quarter = 1
    elif month in [4, 5, 6]:
        quarter = 2
    elif month in [7, 8, 9]:
        quarter = 3
    else:
        quarter = 4
    return quarter
