import os
import sys

import requests

ApiKey = os.environ.get("SIDECAR_API_KEY", "")
BaseURL = os.environ.get("SIDECAR_BASE_URL", "")
CallCount = 0


def usage():
    print("{} fund-slug /path/to/file.pdf".format(sys.argv[0]))


def upload_url():
    return "{}/partners/funds/on-boarding/files".format(BaseURL)


def get_headers():
    global CallCount
    CallCount = CallCount + 1
    return {
        'Sidecar-API-Key': ApiKey,
        'Sidecar-Version': "2021-09-01",
        'Sidecar-Idempotency-Key': "partner-onboarding-doc-{}".format(str(CallCount)),
    }


def main():
    if ApiKey == "":
        print("Set the SIDECAR_API_KEY environment variable and try again")
        return 1

    if BaseURL == "":
        print("Set the SIDECAR_BASE_URL environment variable and try again")
        return 1

    fund_slug = sys.argv[1]
    file_path = sys.argv[2]

    request_data = {
        'id': "{}-sub-doc".format(fund_slug),
        'fund_slug': fund_slug,
        'file_name': "Subscription Document",
        'file_type': "fund-agreement-documents",
        'file_content_type': 'application/pdf',
    }

    headers = get_headers()
    with open(file_path, 'rb') as file_data:
        files = {'file_data': file_data}
        url = upload_url()
        r = requests.post(url, data=request_data, files=files, headers=headers)
        print(r.text)


if __name__ == '__main__':
    main()
