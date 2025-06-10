import os

import sentry_sdk
from environ import environ
from sentry_sdk.integrations.django import DjangoIntegration

env = environ.Env()

SENTRY_DSN = env.str('SENTRY_DSN', None)


def traces_sampler(sampling_context):
    wsgi_environment = sampling_context.get('wsgi_environ', {})
    asgi_environment = sampling_context.get('asgi_scope', {})

    environment = {}
    if wsgi_environment:
        environment.update(wsgi_environment)

    if asgi_environment:
        environment.update(asgi_environment)

    if environment:
        path = environment.get('PATH_INFO') # for wsgi
        if path is None:
            path = environment.get('path') # for asgi

        if path == "/api/health/":
            return 0

    # Set to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    return 1.0


current_env = os.environ.get('APP_ENVIRONMENT', 'local')

# Do not send sentry data for the local environment.
if SENTRY_DSN and current_env != "local":
    # The DSN is not a secret, so it is ok to put here, it shows up in the front end as well.
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sampler=traces_sampler,

        # Do not send PII to sentry
        send_default_pii=False,

        # Send the Environment
        environment=os.environ.get('APP_ENVIRONMENT', 'local'),
        release=os.environ.get("RELEASE_TAG", "unknown")
    )
