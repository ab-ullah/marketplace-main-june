from slugify import slugify

from api.users.models import RetailUser


def get_first_name(user: RetailUser):
    if user.first_name:
        return user.first_name

    if user.email:
        return user.email.split('@')[0]

    return ''


def get_display_name(user: RetailUser):
    if user.full_name:
        return user.full_name

    if user.first_name or user.last_name:
        return '{} {}'.format(user.first_name, user.last_name).strip()

    if user.email:
        return user.email.split('@')[0]

    return ''


def get_full_name(user: RetailUser):
    if user.full_name:
        return user.full_name

    if user.first_name or user.last_name:
        return '{} {}'.format(user.first_name, user.last_name).strip()

    return None


def get_identifier_from_email(user: RetailUser):
    if user.email:
        return slugify(user.email.split('@')[0].lower().strip())

    return ''


def normalize_email(email: str):
    if not email:
        return None

    return email.strip().lower()
