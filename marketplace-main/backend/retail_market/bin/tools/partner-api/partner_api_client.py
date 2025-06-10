import requests
import sys
import os
import json

FUNDS = "funds"
CURRENCIES = "funds/currencies"
FUND_FILES = "funds/files"
FUND_ACTIVITIES = "funds/activities"
INVESTORS = "investors"
INVESTOR_FILES = "investors/files"
LOAN_ACTIVITIES = "loans/activities"
ApiKey = os.environ.get("SIDECAR_API_KEY", "")
BaseURL = os.environ.get("SIDECAR_BASE_URL", "")
BasePath = ""
CallCount = 0



def usage():
    print("{} /path/to/directory".format(sys.argv[0]))


def processor_for_file(file):
    if "01-funds.json" in file:
        return fund_processor
    elif "02-currencies.json" in file:
        return currency_processor
    elif "05-fund-files.json" in file:
        return fund_files_processor
    elif "04-fund-activities.json" in file:
        return fund_activities_processor
    elif "03-investors.json" in file:
        return investor_processor
    elif "06-investors-files.json" in file:
        return investor_files_processor
    elif "07-loan-activities.json" in file:
        return loan_activities_processor
    else:
        return unknown_processor


def unknown_processor(json_data):
    print("Error - Do not know how to process this data")

def fund_processor(json_data):
    print("processing {}".format(FUNDS))
    make_request(FUNDS, json_data)


def currency_processor(json_data):
    print("processing {}".format(CURRENCIES))
    #make_request(CURRENCIES, json_data)

def fund_files_processor(json_data):
    print("processing {}".format(FUND_FILES))
    #make_request(FUND_FILES, json_data)


def fund_activities_processor(json_data):
    print("processing {}".format(FUND_ACTIVITIES))
    make_request(FUND_ACTIVITIES, json_data)

def investor_processor(json_data):
    print("processing {}".format(INVESTORS))
    make_request(INVESTORS, json_data)


def investor_files_processor(files):
    """Files are uploaded one at a time, so break up the array here and send the requests one at a time"""
    print("processing {}".format(INVESTOR_FILES))

    for entry in files:
        request_data = {}
        for field in ["id", "investor_vehicle_id", "file_type", "file_name", "file_content_type", "file_date", "skip_notification", "fund_id"]:
            request_data[field] = entry[field]
        # Capital call requires a due date
        if "capital-call" == entry["file_type"]:
            request_data["due_date"] = entry["due_date"]
        file_name = os.path.join(BasePath, entry["file_data_path"])
        headers = get_headers()
        file_data = open(file_name, 'rb')
        files = {'file_data': file_data}
        url = build_url(INVESTOR_FILES)
        r = requests.post(url, data=request_data, files=files, headers=headers)
        print(r.text)


def loan_activities_processor(json_data):
    print("processing {}".format(LOAN_ACTIVITIES))
    make_request(LOAN_ACTIVITIES, json_data)


def make_request(path, json_data):
    if len(json_data) == 0:
        print("skipping empty {}".format(path))
        return

    url = build_url(path)

    r = requests.post(url, json=json_data, headers=get_headers())
    print(r.text)

def get_headers():
    global CallCount
    CallCount = CallCount + 1
    return {'Sidecar-API-Key': ApiKey,
               'Sidecar-Version': "2021-09-01",
               'Sidecar-Idempotency-Key': "partner-api-client-{}".format(str(CallCount))
               }

def build_url(path):
    return "{}/partners/{}".format(BaseURL, path)


def main():
    """expects to be passed a directory and for each file will make requests to the relevant endpoint"""
    global BasePath

    if len(sys.argv) < 2:
        usage()
        return 1

    if ApiKey == "":
        print("Set the SIDECAR_API_KEY environment variable and try again")
        return 1

    if BaseURL == "":
        print("Set the SIDECAR_BASE_URL environment variable and try again")
        return 1

    directory_of_files = sys.argv[1]
    BasePath = directory_of_files
    files = [f for f in os.listdir(directory_of_files) if os.path.isfile(os.path.join(directory_of_files, f))]
    files.sort()
    for file in files:
        full_path = os.path.join(directory_of_files, file)
        json_processor = processor_for_file(file)
        with open(full_path) as f:
            json_data = json.load(f)
            json_processor(json_data)


if __name__ == '__main__':
    main()
