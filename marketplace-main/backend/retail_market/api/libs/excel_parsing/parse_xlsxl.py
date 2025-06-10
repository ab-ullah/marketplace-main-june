from pyexcel_xlsx import get_data


def xlsx_to_dicts(excel_file):
    rows = get_data(excel_file)
    sheets = rows.values()
    parsed_rows = []
    for sheet_rows in sheets:
        if len(sheet_rows) < 2:
            continue
        column_headers = sheet_rows[0]
        for data_row in sheet_rows[1:]:
            parsed_row = {}
            for idx, header in enumerate(column_headers):
                parsed_row[column_headers[idx]] = data_row[idx]
            parsed_rows.append(parsed_row)
    return parsed_rows
