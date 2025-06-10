#!/bin/bash
#set -e

python config/json_to_env.py ${SECRETS_ID} > ${CONFIG_SECRETS_DIR}/.env
python config/get_secret.py ${DS_SECRETS_ARN} > ${DS_PKEY_PATH}
ln -s ${CONFIG_SECRETS_DIR}/.env .env

# Run the database migrations for this environment.
python manage.py locked_migrate

# Make sure our data is setup and ready for use (don't run in prod)
#if [[ "${APP_ENVIRONMENT}" != "prod" ]]
#then
  python manage.py setup_db
#fi

if [[ "${APP_START_QCLUSTER}" == "True" ]]
then
  echo "Starting QCluster"
  python manage.py qcluster
else
  echo "Starting App Server"
  # TODO: when we want to verify this cert in service to service calls, we will want to save this app.crt for now, we just want to extend the encryption chain down to the host from the ALB.
  /usr/src/app/bin/generate-self-signed-tls-cert.sh --cn ${INTERNAL_DOMAIN} --country US --state NJ --city Summit  --org Sidecar --dir ${CONFIG_SECRETS_DIR}/tls

  # boot up gunicorn using our self signed cert.
  #gunicorn --access-logfile - --certfile=${CONFIG_SECRETS_DIR}/tls/app.crt --keyfile=${CONFIG_SECRETS_DIR}/tls/app.key --bind :8443 --workers 1 config.wsgi

  # Start Daphne
  daphne --access-log - -e ssl:8443:privateKey=${CONFIG_SECRETS_DIR}/tls/app.key:certKey=${CONFIG_SECRETS_DIR}/tls/app.crt config.asgi:application
fi
