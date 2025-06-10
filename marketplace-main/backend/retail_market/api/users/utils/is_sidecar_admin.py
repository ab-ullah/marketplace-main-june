from api.users.models import RetailUser


def is_user_sidecar_admin(user: RetailUser):
    return user.is_sidecar_admin
