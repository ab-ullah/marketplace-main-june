from api.admin_users.models import AdminUser
from api.companies.models import Company, CompanyUser
from api.users.models import RetailUser


def get_users_in_company(company: Company):
    user_ids = CompanyUser.objects.filter(
        company=company
    ).values_list('user_id', flat=True)
    user_ids = list(set(user_ids))
    return RetailUser.objects.filter(id__in=user_ids)


def get_include_deleted_users_in_company(company: Company):
    user_ids = CompanyUser.include_deleted.filter(
        company=company
    ).values_list('user_id', flat=True)
    admin_user_ids = AdminUser.objects.filter(
        company=company
    ).values_list('user_id', flat=True)
    user_ids = list(set(user_ids)-set(admin_user_ids))
    return RetailUser.include_deleted.filter(id__in=user_ids)


def get_invited_users_in_company(company: Company):
    user_ids = CompanyUser.objects.filter(
        company=company
    ).values_list('user_id', flat=True)
    user_ids = list(set(user_ids))
    return RetailUser.objects.filter(id__in=user_ids, invite_status__isnull=False)


def get_all_users_in_company(company: Company):
    company_user_ids = CompanyUser.objects.filter(
        company=company
    ).values_list('user_id', flat=True)
    admin_user_ids = AdminUser.objects.filter(
        company=company
    ).values_list('user_id', flat=True)
    user_ids = list(set(list(company_user_ids) + list(admin_user_ids)))

    return RetailUser.objects.filter(id__in=user_ids).order_by('id')


def get_admin_users_in_company(company: Company):
    admin_user_ids = AdminUser.objects.filter(
        company=company
    ).values_list('user_id', flat=True)
    return RetailUser.objects.filter(id__in=admin_user_ids).order_by('id')
