from api.admin_users.models import AdminUser
from api.documents.models import Document
from api.libs.user.user_helper import UserHelper
from api.users.models import RetailUser


def admin_can_access_document(document: Document, admin_user: AdminUser):
    return document.company_id == admin_user.company_id


def user_can_access_document(document: Document, user: RetailUser):
    company_users = UserHelper.get_company_users(user=user)
    company_user_ids = [company_user.id for company_user in company_users]
    company_ids = UserHelper.get_company_ids(company_users=company_users)

    if document.access_scope == Document.AccessScopeOptions.COMPANY:
        return document.company_id in company_ids

    if document.access_scope == Document.AccessScopeOptions.USER_ONLY:
        return document.uploaded_by_user_id in company_user_ids

    if document.access_scope == Document.AccessScopeOptions.INVESTOR_ONLY:
        return document.document_investors.filter(
            investor__associated_users__company_user_id__in=company_user_ids
        ).exists()

    return False


def get_document_permission_from_request(document: Document, request):
    if hasattr(request.user, 'admin_user'):
        return admin_can_access_document(document=document, admin_user=request.user.admin_user)

    return user_can_access_document(document=document, user=request.user)
