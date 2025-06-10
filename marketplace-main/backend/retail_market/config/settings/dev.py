from .base import *
from .sentry import *

# SECURITY WARNING: don't run with debug turned on in production!

DEBUG = False
ALLOWED_HOSTS = ["*"]

INTERNAL_IPS = [
    '127.0.0.1',
]
