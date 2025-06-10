from random import randint

from api.admin_users.models import AdminUser
from api.companies.models import Company


def select_random_reviewer_by_group(company: Company, group_name: str):
    knowledgeable_admins = AdminUser.objects.filter(
        company=company,
        groups__name=group_name
    )
    available_reviewer_ids = list(knowledgeable_admins.values_list('id', flat=True))
    if not available_reviewer_ids:
        return None
    random_index = randint(0, len(available_reviewer_ids) - 1)
    return AdminUser.objects.get(
        company=company,
        id=available_reviewer_ids[random_index]
    )
