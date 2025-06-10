from api.investors.models import Investor
from api.libs.utils.user_name import normalize_email
from api.users.models import RetailUser


class InvalidInvestorUserRelationException(Exception):
    """For case where a wrong investor is being associated with a user"""
    pass


class ValidateUserInvestorRelationService:
    def __init__(self, investor: Investor, email: str):
        self.investor = investor
        self.email = email

    def get_investor_user_emails(self):
        emails = self.investor.associated_users.values_list('company_user__user__email', flat=True)
        return [normalize_email(email) for email in emails]

    def validate(self):
        allowed_emails = self.get_investor_user_emails()
        user_email = normalize_email(self.email)
        if allowed_emails and user_email not in allowed_emails:
            raise InvalidInvestorUserRelationException('Invalid Relation')
