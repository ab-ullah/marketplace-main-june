## Setup Guide

#### Prerequisites

1. Brew installed (https://brew.sh/)
2. Docker installed (https://docs.docker.com/desktop/install/mac-install/)
3. postgresql installed `brew install postgresql`
4. lffi installed (https://cffi.readthedocs.io/en/latest/installation.html#macos-x)
5. weasyprint installed `brew install weasyprint`

#### Setup

1. Install python 3.8 https://www.python.org/downloads/release/python-380/
2. Create a virtualenv for the project
3. Install the dependencies with `pip install -r requirements.local.txt`
4. Start the docker container, using the [docker-compose.yml](../../docker-compose.yml) file run `docker compose up`.
5. Create user, database and adding access on PostgreSQL with the terminal `psql` client or any other PSQL compatible client run:
    ```
        create database <<db_name>;
        create user <<username>> with encrypted password '<<password>>';
        grant all privileges on database <<db_name> to <<username>>;
    ```
6. Setup the database params in .env file, the sample is in .env.sample
7. Read and follow the Dependencies section in this document, so you set AWS dependencies and encryption
8. Run migrations `python manage.py migrate`
9. Load the data according to Loading Demo Data section in this document



#### Troubleshooting

1. if running `python manage.py` throws an error like
```
    TypeError: deprecated() got an unexpected keyword argument 'name'
``` 
then run `pip uninstall pyOpenSsl`

2. if you have errors installing psycopg2-binary, make sure you have the path of pg_config program in your PATH, if you don't then run: `export PATH=$PATH:$(which pg_config)`
3. if running `python manage.py migrate` throws an error like
```
    OSError: cannot load library 'gobject-2.0-0': dlopen(gobject-2.0-0, 0x0002): tried: 'gobject-2.0-0' (no such file)
``` 

### Dependencies
If AWS_LOCAL is true then localstack needs to be running for document uploads to work
If you plan to use localstack, it is recommended to install awslocal so you don't have to set the endpoint url for every aws command

`pip install awscli-local`

* AWS KMS Key for documents:
    Create a key to encrypt documents at rest, make sure the key is in the same region as the s3 bucket used for storage.  You will need the KeyId returned by this command

`awslocal kms create-key --region $AWS_REGION`

* AWS S3 bucket for storing documents:
`awslocal s3api create-bucket --bucket ${env}-us-primary-hellosidecar-documents --region $AWS_REGION`

* AWS S3 bucket for public assets:
`awslocal s3api create-bucket --bucket assets-local --region $AWS_REGION`

make sure to set both:
  `AWS_PUBLIC_ASSETS_CLOUDFRONT_DOMAIN=assets.local.aws`
  `AWS_PUBLIC_ASSETS_ENDPOINT=http://localhost:4566/`

Note that the cloudfront domain MUST not include a protocol.  
You will also may need to manually trust https for localstack, since the backend will only generate https urls.
The domain is the output from the s3api create-bucket command:

    awslocal s3api create-bucket --bucket assets-local --region us-west-2
    {
        "Location": "http://assets-local.s3.localhost.localstack.cloud:4566/"
    }


where `${env}` is the environment name like local, dev, staging, production etc.

Note: that the AWS dependencies assume you are running with a user who has permission to mutate the AWS account to create these infrastructure pieces.  
It also assumes that the service runnign will have access to use these resources.

Notes:
1. to create the resources in a real AWS account change awslocal to aws.
2. where $AWS_REGION should be aws region, but remember that if the region is not us-east-1 then you will have to specify the location contraints while creating the buckets

### Setting up your machine for encrypted database field data.
To facilitate moving data between our non-production environments we use the same key and same key rotation in our
environments you can get the key in 1pasword via the NON-Production DB Field Encryption Key credential

Make sure to set FIELD_ENCRYPTION_KEY in .env with that value.


### Loading Demo Data

These are the necessary steps to get test data into the app:

1. Create a company and a company token:
```
python manage.py create_company sidecar
```
The output should contain the company token:
```
{
    "name": "sidecar",
    "token": "ffff82f5f1f24747f1f9fff7f149ff68"
}
```

2. Start the retail_market app
  - Create an `.env` file with the necessary configuration settings:
    ```

    # Use the Docker container DB settings
    DB_NAME=<<db_name>
    DB_USER=<<username>>
    DB_PASSWORD=<<password>>
    DB_HOST=<<host>
    DB_PORT=<<port>

    # Request to be added to the HelloSideCar `engineering` group in 1Password to have access to the Authn0 settings for LOCAL and DEV
    AUTH0_DOMAIN=...
    AUTH0_NON_INTERACTIVE_CLIENT_ID=...
    AUTH0_NON_INTERACTIVE_CLIENT_SECRET=...
    AUTH0_CONNECTION=...
    AUTH0_ALGO=...
    AUTH0_API_IDENTIFIER=...
    AUTH0_AUTH_PREFIX=...

    # Set to false if you want to use real AWS
    # when set to true, assumes you have localstack: https://localstack.cloud/ running
    # Check the Dependencies section in the backend/retail_market/README.md file
    AWS_LOCAL=true
    AWS_DOCUMENT_BUCKET=...
    AWS_DOCUMENT_KMS_KEY_ID=...
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...

    # Use the Docker container Redis settings
    CACHE_REDIS_URL=redis://<<host>>:<<port>>

    #DOCUSIGN for local development get the properties from the engineering vault in 1password 
    DS_AUTH_SERVER=""
    DS_CLIENT_ID=""
    DS_IMPERSONATED_USER_ID=""

    ```
  - Download the docusign private key development file "ds_private.key" from the engineering vault in 1password into the "retail_market/config" folder 
3. Load all the master data for your local environment
    
    ```shell
    %> python manage.py setup_db
    ```

    If you add new data that needs to be setup on everyones developer instance, please add it to the setup_db command.   

4. Download the API test data ([api-data-2022-02-18.zip](https://drive.google.com/file/d/19_JjbiZ9ssTXpzK_qB-9VxUAvFdarEe-/view?usp=sharing)) from Google Drive
  - Unzip the file, it should contain the following files:
    ```
      + api-data/
      |
      ├- 01-funds.json
      ├- 02-currencies.json
      ├- 03-investors.json
      ├- 04-fund-activities.json
      ├- 05-fund-files.json
      ├- 06-investors-files.json
      ├- 07-loan-activities.json
      ├- + files/
         |
         ├- ag01.pdf
         ├- cc01.pdf
    ```
  - Update `03-investors.json` using an email access on which we have access to the inbox, it can be our own  `@hellosidecar.com` email address.


5. Execute the `backend/retail_market/bin/tools/partner-api/partner_api_client.py` tool.
  - Add an `.env` file for `backend/retail_market/bin/tools/partner-api`
  ```

    # Use the company token from step 1
    SIDECAR_API_KEY=<<token>>
    SIDECAR_BASE_URL=http://<<retail_market-localhost>>:<<retail_market_localport>>
  ```
  - Run `(env38)$ python partner_api_client.py <</path/to/unzipped-api-data-folder>>`
  
6. Update our testing fund in the DB, setting the `is_published` flag to `True`
  - Run this update query in our DB:
  ```
     UPDATE funds_fund 
        SET is_published=True
        FROM activities_fundactivity
        WHERE 
            funds_fund.raw_investment_product_code=activities_fundactivity.raw_investment_product_code;  
  ```

Note:
Once the `sidecar-investor` frontend app is running we should be able to complete the login flow and see the investor dashboard in the browser

### Running the backend and front end
- Set .env files for the front end and backend environments
- Run the following commands to start the apps, avoid running the admin and investor site at the same time since they both need to run in the same port to have oath working

from the backend run:
    python manage.py runserver

from the frontend run
    yarn install
    yarn start


force bump to trigger CI.. 5


### Working on tests for data migrations

For data migrations that have complicated or sensitive logic, we should write tests considering the following aspects:
 - Use the Migrator helper from the base tests, to run the migrations and get the models
 - The test is supposed to be isolated, so to populate with data you shouldn't use the regular factories in the tests, as it might break the run, the models from the helper must be used just like in the onw migration code
 - You can use the BaseTestCase but the instances of the models created with the helper don't have the same interface as the true model entities, so you'll have errors assigning foreing keys unless you use the id directly
 - Be careful with the dependencies of the data migration, without the proper migrations applied you won't be able to use the helper models with the correct fields