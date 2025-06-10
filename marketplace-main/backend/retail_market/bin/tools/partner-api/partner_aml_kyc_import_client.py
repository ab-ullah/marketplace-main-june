import os
import sys
import csv
import json

import requests
import mimetypes

ApiKey = os.environ.get("SIDECAR_API_KEY", "")
BaseURL = os.environ.get("SIDECAR_BASE_URL", "")
CallCount = 0
BasePath = ""

EMAIL = 0
FIRSTNAME = 1
LASTNAME = 2
INVESTING_AS = 3
DOC_ID = 4
INVESTOR_ACCOUNT_CODE = 5
FILENAME = 6
DOC_TYPE = 7
# skip over status, comments, etc
ACT_FILE_NAME = 11


class Doc:
    def __init__(self, file_path, doc_type, unique_id, display_name):
        self.id = unique_id
        self.doc_type = doc_type
        self.file_path = file_path
        self.display_name = display_name

    def request_data(self, sidecar_id):
        return {
            'id': self.id,
            'sidecar_id': sidecar_id,
            'document_type': self.doc_type,
            'title': self.display_name,
            'file_content_type': self._content_type()
        }

    def file_data(self):
        file_data = open(self.file_path, 'rb')
        return {'file_data': file_data}

    def _content_type(self):
        mtype, _ = mimetypes.guess_type(self.display_name)
        return mtype

class Investor:
    def __init__(self, row):
        self._row = row
        self.id = row[DOC_ID]
        self.first_name = row[FIRSTNAME]
        self.last_name = row[LASTNAME]
        self.email = row[EMAIL]
        self.investor_account_code = row[INVESTOR_ACCOUNT_CODE]
        self.investing_as = row[INVESTING_AS]
        self.file_path = row[ACT_FILE_NAME]
        self.docs = [Doc(self._full_file_path(), row[DOC_TYPE], self.id, row[FILENAME])]
        self.sidecar_id = None

    def valid(self):
        is_valid = True

        if self.id is None or self.id == "":
            print("expecting an id")
            is_valid = False

        if self.first_name is None or self.first_name == "":
            print("expecting a first name")
            is_valid = False

        if self.last_name is None or self.last_name == "":
            print("expecting a last name")
            is_valid = False

        if self.email is None or self.email == "":
            print("expecting an email address")
            is_valid = False

        if self.investor_account_code is None or self.investor_account_code == "":
            print("expecting an investor account code")
            is_valid = False

        if self.investing_as is None or self.investing_as == "":
            print("expecting investing_as")
            is_valid = False

        if self.file_path and self.file_path != "":
            # make sure the file is valid if it is set.
            if not os.path.isfile(self._full_file_path()):
                is_valid = False
                print("expected a file file")

        if not is_valid:
            print("row is : {}".format(self._row))

        return is_valid

    def request_data(self):
        return {
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'investor_account_code': self.investor_account_code,
            'investing_as': self.investing_as
        }

    def _full_file_path(self):
        return os.path.join(BasePath, self.file_path)

    def key(self):
        return self.investor_account_code

    def add_doc_from(self, other_investor):
        self.docs.append(other_investor.docs[0])


def usage():
    print("{} fund-slug /path/to/file.pdf".format(sys.argv[0]))


def upload_url(for_doc=False):
    prefix = "{}/partners/kyc_record".format(BaseURL)
    if for_doc:
        return "{}/document".format(prefix)

    return prefix


def get_headers():
    global CallCount
    CallCount = CallCount + 1
    return {
        'Sidecar-API-Key': ApiKey,
        'Sidecar-Version': "2021-09-01",
        'Sidecar-Idempotency-Key': "partner-amlkyc-import-{}".format(str(CallCount)),
    }


def main():
    global BasePath

    if ApiKey == "":
        print("Set the SIDECAR_API_KEY environment variable and try again")
        return 1

    if BaseURL == "":
        print("Set the SIDECAR_BASE_URL environment variable and try again")
        return 1

    import_file = sys.argv[1]
    BasePath = sys.argv[2]
    users_to_import = {}
    valid_batch = True

    with open(import_file, newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        next(reader) # Skip headers
        for row in reader:
            investor = Investor(row)
            if not investor.valid():
                valid_batch = False
                continue

            if investor.key() in users_to_import:
                # already have them in the batch
                existing_investor = users_to_import[investor.key()]
                existing_investor.add_doc_from(investor)
            else:
                users_to_import[investor.key()] = investor

    if not valid_batch:
        print("CSV is not correct, skipping API Steps")
        return

    # First process all the investors
    for key in users_to_import:
        investor = users_to_import[key]
        request_data = investor.request_data()
        headers = get_headers()
        url = upload_url()

        # print(request_data)
        r = requests.post(url, data=request_data, headers=headers)
        response = json.loads(r.text)
        investor.sidecar_id = response['sidecar_id']


    # Now process all the docs for the investors
    for key in users_to_import:
        investor = users_to_import[key]
        for doc in investor.docs:
            request_data = doc.request_data(investor.sidecar_id)
            headers = get_headers()
            url = upload_url(for_doc=True)
            r = requests.post(url, data=request_data, files=doc.file_data(), headers=headers)
            print(r.text)
#            print(request_data)


if __name__ == '__main__':
    main()
