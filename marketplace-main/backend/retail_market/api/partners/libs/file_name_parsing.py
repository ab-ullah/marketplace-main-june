import re

FILE_NAME_SEPARATOR = '_'


def parse_file_name(file_name):
    file_parts = file_name.split(FILE_NAME_SEPARATOR)

    # Make sure that the four fields we expect are present
    if len(file_parts) < 5 or len(file_parts) > 8:
        return None

    # Since the first two segments are optional, they may be one or two
    # of them, we index from the end vs indexing from the front of the
    # file parts.
    # Commenting out these since we don't need them, leaving the
    # comments as documentation for why fund id starts in the 2nd index.
    # company = file_parts[-7]
    # environment = file_parts[-6]

    index = -1
    due_date = None
    expected_pay_date = None
    sequence_number = None

    if 'distribution' in file_name.lower():
        expected_pay_date = parse_date(file_parts[index])
        index = index - 1

    if 'capital-call' in file_name.lower():
        # We are supposed to have a due date
        due_date = parse_date(file_parts[index])
        index = index - 1

    file_date = parse_date(file_parts[index])

    if 'distribution' in file_name.lower() or 'capital-call' in file_name.lower():
        sequence_number = file_parts[index - 1]
        index = index - 1

    file_type = parse_file_type(file_parts[index - 1])
    investor_vehicle_id = file_parts[index - 2]

    if (len(file_parts) + index - 3) < 0:
        return None

    fund_id = file_parts[index - 3]

    # Make sure all the fields have a value (don't check due_date since not all docs have one)
    if fund_id == "" or investor_vehicle_id == "" or file_type == "" or file_date == "":
        return None

    return {
        'fund_id': fund_id,
        'investor_vehicle_id': investor_vehicle_id,
        'file_type': file_type,
        'file_date': file_date,
        'due_date': due_date,
        'expected_pay_date': expected_pay_date,
        'sequence_number': sequence_number,
    }

def parse_file_type(file_type_part):
    return file_type_part.lower()

def parse_date(date_part):
    # Make sure that if someone passes us the filename with a . and extension that we chop off the extension
    date_parts = date_part.split('.')
    return date_parts[0]