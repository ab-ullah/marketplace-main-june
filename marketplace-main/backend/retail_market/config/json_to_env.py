#!/usr/bin/env python
import json
import sys
import os
import boto3

def main():
    """Take a json file from AWS secrets manager and create an exported environment suitable for django"""
    endpoint_url = os.environ.get("LOCALSTACK_URL")
    client = boto3.client('secretsmanager',
                          endpoint_url=endpoint_url)

    # Iterate over the parameters and export the environment from each of them
    for secret_id in sys.argv[1:]:
        response = client.get_secret_value(SecretId=secret_id)
        secret_data = response["SecretString"]
        config = json.loads(secret_data)
        for key, value in config.items():
            print("{}={}".format(key, value))

if __name__ == '__main__':
    main()