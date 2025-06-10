import json
import logging

import jwt
import requests
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.cache import cache

from api.companies.models import CompanyUser
from api.users.models import RetailUser
from api.users.services.create_company_user import CreateCompanyUserService

logger = logging.getLogger(__name__)

JWKS_CACHE_KEY = 'AUTH0_JWKS'


def get_user_info(token):
    domain = settings.AUTH0_DOMAIN
    url = 'https://{domain}/userinfo'.format(domain=domain)
    response = requests.get(url, headers={'Authorization': 'Bearer {}'.format(token)})
    return response.json()


def jwt_get_username_from_payload_handler(payload):
    username = payload.get('sub').replace('|', '.')
    user = authenticate(remote_user=username)
    if not user:
        user_info = get_user_info(payload['token'])
        user, _ = RetailUser.include_deleted.update_or_create(
            email__iexact=user_info.get('email'),
            defaults={
                'username': username,
                'email': user_info.get('email'),
                'is_active': True
            }
        )
    if not user.email:
        user_info = get_user_info(payload['token'])
        user.email = user_info.get('email')
        user.save()

    if user.invite_status and user.invite_status == RetailUser.UserInviteStatusChoices.INVITED.value:
        user.invite_status = RetailUser.UserInviteStatusChoices.ACCEPTED_INVITE.value
        user.save(update_fields=['invite_status'])

    if not CompanyUser.objects.filter(user=user).exists():
        CreateCompanyUserService(user=user).create()

    return username


def get_jwks(use_cache: bool):
    if use_cache:
        cache_value = cache.get(JWKS_CACHE_KEY)
        if cache_value:
            return cache_value

    domain = settings.AUTH0_DOMAIN
    jwks = requests.get('https://{}/.well-known/jwks.json'.format(domain)).json()
    cache.set(JWKS_CACHE_KEY, jwks)
    return jwks


def get_public_key(jwks, header):
    public_key = None
    try:
        for jwk in jwks['keys']:
            if jwk['kid'] == header['kid']:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))
    except Exception as e:
        logger.error(e)
    return public_key


def jwt_decode_token(token):
    domain = settings.AUTH0_DOMAIN
    header = jwt.get_unverified_header(token)
    jwks = get_jwks(use_cache=True)
    public_key = get_public_key(jwks, header)

    if public_key is None:
        jwks = get_jwks(use_cache=False)
        public_key = get_public_key(jwks, header)

    if public_key is None:
        raise Exception('Public key not found.')

    issuer = 'https://{}/'.format(domain)

    decoded_payload = jwt.decode(
        token,
        public_key,
        audience=settings.AUTH0_API_IDENTIFIER,
        issuer=issuer,
        algorithms=[settings.AUTH0_ALGO]
    )
    return {**decoded_payload, 'token': token}
