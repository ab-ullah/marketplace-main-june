from auth0.v3.authentication import GetToken
from auth0.v3.management import Auth0
from django.conf import settings


class Auth0ManagementAPI:
    def __init__(self):
        self.domain = settings.AUTH0_MANAGEMENT_API_DOMAIN
        self.client_id = settings.AUTH0_NON_INTERACTIVE_CLIENT_ID
        self.client_secret = settings.AUTH0_NON_INTERACTIVE_CLIENT_SECRET
        self.connection = settings.AUTH0_CONNECTION
        self.token = self.get_token()

    def get_token(self):
        get_token = GetToken(self.domain)
        token = get_token.client_credentials(
            self.client_id,
            self.client_secret,
            'https://{}/api/v2/'.format(self.domain)
        )
        return token['access_token']

    def get_users(self):
        auth0 = Auth0(self.domain, self.token)
        users = auth0.users.list()
        return users.get('users', [])

    def create_user(self, user_info):
        auth0 = Auth0(self.domain, self.token)
        payload = {
            **user_info,
            'connection': self.connection,
            'email_verified': True
        }
        response = auth0.users.create(body=payload)
        return response

    def change_password(self, user_id):
        auth0 = Auth0(self.domain, self.token)
        payload = {
            "mark_email_as_verified": True,
            'user_id': user_id,
        }
        response = auth0.tickets.create_pswd_change(payload)
        return response
