from docusign_esign import ApiClient

def create_api_client(base_path, oauth_host, access_token):
    """Create api client and construct API headers"""
    api_client = ApiClient(base_path=base_path, oauth_host_name = oauth_host)
    api_client.host = base_path
    api_client.set_default_header(header_name="Authorization", header_value=f"Bearer {access_token}")

    return api_client



