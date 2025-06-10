from api.companies.models import CompanyUser
from api.constants.headers import VIEW_AS_COMPANY_USER_ID, SHOW_UNPUBLISHED_FUNDS, ADVISOR_VIEW_AS_USER_ID


def get_view_as_user(request):
    if not hasattr(request.user, 'admin_user'):
        return None
    view_as_user_id = request.headers.get(VIEW_AS_COMPANY_USER_ID)
    if not view_as_user_id:
        return None
    try:
        view_as_user_id = int(view_as_user_id)
    except:
        return None
    try:
        company_user = CompanyUser.objects.get(
            id=view_as_user_id,
            company=request.user.admin_user.company
        )
    except CompanyUser.DoesNotExist:
        return None
    return company_user


def get_show_unpublished_funds(request):
    if not hasattr(request.user, 'admin_user'):
        return None
    view_as_user_id = request.headers.get(VIEW_AS_COMPANY_USER_ID)
    if not view_as_user_id:
        return None

    show_unpublished_funds = request.headers.get(SHOW_UNPUBLISHED_FUNDS)
    if not show_unpublished_funds:
        return False
    return show_unpublished_funds.lower() == 'true'


def get_view_as_advisor(request):
    if not request.user.is_advisor:
        return None
    view_as_user_id = request.headers.get(ADVISOR_VIEW_AS_USER_ID)
    if not view_as_user_id:
        return None
    try:
        view_as_user_id = int(view_as_user_id)
    except:
        return None
    try:
        company_user = CompanyUser.objects.get(
            id=view_as_user_id
        )
    except CompanyUser.DoesNotExist:
        return None
    return company_user
