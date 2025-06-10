#!/usr/bin/env python
import json
import sys
import os
import boto3

def main():
    """Take a string from AWS secrets manager and prints it, suitable for redirection"""
    endpoint_url = os.environ.get("LOCALSTACK_URL")
    client = boto3.client('secretsmanager',
                          endpoint_url=endpoint_url)
    response = client.get_secret_value(SecretId=sys.argv[1])
    secret_data = response["SecretString"]
    print(secret_data)

if __name__ == '__main__':
    main()