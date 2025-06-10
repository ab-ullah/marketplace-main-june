from .base import *

# SECURITY WARNING: don't run with debug turned on in production!

DEBUG = True
ALLOWED_HOSTS = ["*"]

INTERNAL_IPS = [
    '127.0.0.1',
]

# if DEBUG:
#     INSTALLED_APPS += [
#         'api.demos',
#         'debug_toolbar'
#     ]
#
#     MIDDLEWARE = [
#                      'debug_toolbar.middleware.DebugToolbarMiddleware',
#                      'api.libs.middlewares.debug.NonHtmlDebugToolbarMiddleware',
#
#                  ] + MIDDLEWARE

STATIC_URL = '/static/'

aws_access_key_id = env('AWS_ACCESS_KEY_ID', default=None)
aws_secret_access_key = env('AWS_SECRET_ACCESS_KEY', default=None)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
    }
}

REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
    'rest_framework.renderers.JSONRenderer',
)

# TODO: make sure this works in all our environments, not just local.
STATEMENTS_CSS_URL = 'http://localhost:8000/static/statements/style.css'
STATEMENTS_BASE_URL = 'http://localhost:8000/'

Q_CLUSTER = {**Q_CLUSTER, 'sync': True}

IS_TEST_RUN = False
