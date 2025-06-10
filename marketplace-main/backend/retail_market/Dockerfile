# pull our base image
FROM 391503469783.dkr.ecr.us-west-2.amazonaws.com/sidecar-base-python:latest


# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV APP_ENVIRONMENT stage

# Set dependencies from the infrastructure (based on .env.sample
ENV SECRETS_ID secret-manager-id
ENV DB_NAME db_name
ENV DB_HOST postgres-host-address
ENV DB_PORT postgres-port

COPY ./requirements.txt /usr/src/app
COPY ./bin/mime.types /etc/apache2/mime.types

RUN pip install -r requirements.txt --no-cache-dir && \
 apk --purge del .build-deps

RUN pip install daphne
RUN pip install -U 'Twisted[tls,http2]'

# add AWS RDS CA bundle
ADD https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem /tmp/rds-ca/aws-rds-ca-bundle.pem
# split the bundle into individual certs (prefixed with xx)
# see http://blog.swwomm.com/2015/02/importing-new-rds-ca-certificate-into.html
RUN cd /tmp/rds-ca && cat aws-rds-ca-bundle.pem|awk 'split_after==1{n++;split_after=0} /-----END CERTIFICATE-----/ {split_after=1} {print > "cert" n ""}' \
    && for CERT in /tmp/rds-ca/cert*; do mv $CERT /usr/local/share/ca-certificates/aws-rds-ca-$(basename $CERT).crt; done \
    && rm -rf /tmp/rds-ca \
    && update-ca-certificates

# copy project
COPY . /usr/src/app

EXPOSE 8443
CMD ["/usr/src/app/bin/run-server.sh"]

