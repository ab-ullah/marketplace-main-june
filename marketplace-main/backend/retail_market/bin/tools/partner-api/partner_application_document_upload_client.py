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
    def __init__(self, application_id, document_name, document_description, partner_id, file_path, uuid):
        self.application_id = application_id
        self.id = partner_id
        self.uuid = uuid
        self.file_path = file_path
        self.document_name = document_name
        self.document_description = document_description

    def request_data(self):
        return {
            "partner_id": self.id,
            "uuid": self.uuid,
            "application_id": self.application_id,
            "document_name": self.document_name,
            "document_description": "Imported Documentation for source of wealth",
            "file_content_type": self._content_type()
        }

    def file_data(self):
        full_path = self._full_file_path()
        file_data = open(full_path, 'rb')
        return {'file_data': file_data}

    def _content_type(self):
        mtype, _ = mimetypes.guess_type(self.file_path)
        return mtype

    def _full_file_path(self):
        return os.path.join(BasePath, self.file_path)

    @staticmethod
    def from_row(row):
        return Doc(row[0], row[1], row[2], row[3], row[4], row[5])

def usage():
    print("{} /path/to/file.pdf /base/path".format(sys.argv[0]))

def upload_url(for_doc=False):
    return "{}/partners/applications/document".format(BaseURL)

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
    url = upload_url()

    with open(import_file, newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        next(reader) # Skip headers
        for row in reader:
            doc = Doc.from_row(row)
            request_data = doc.request_data()
            headers = get_headers()
            r = requests.post(url, data=request_data, files=doc.file_data(), headers=headers)
            print(r.text)



if __name__ == '__main__':
    main()
