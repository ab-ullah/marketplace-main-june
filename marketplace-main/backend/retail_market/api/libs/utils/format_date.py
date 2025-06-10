from datetime import datetime


def format_date(date_str):
    if not date_str:
        return date_str

    try:
        date = date_str
        day = date.strftime("%d")
        month = date.strftime("%B")
        year = date.strftime("%Y")
        return f'{month} {day}, {year}'
    except:
        return date_str
