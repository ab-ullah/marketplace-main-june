from django.contrib.auth.models import Group

from api.admin_users.models import AdminUser
from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.users.constants import (AGREEMENT_REVIEWER, ALLOCATION_REVIEWER,
                                 CAPITAL_CALL_REVIEWER,
                                 DISTRIBUTION_NOTICE_REVIEWER,
                                 EXTERNAL_REVIEWER,
                                 FINANCIAL_ELIGIBILITY_REVIEWER,
                                 GENERAL_PARTNER_SIGNER, INTERNAL_TAX_REVIEWER,
                                 KNOWLEDGEABLE_ELIGIBILITY_REVIEWER, COMPENSATION_ADMIN, CARRY_REVIEWER)


class CreateReviewerService:
    def __init__(self, email: str, company_name: str):
        self.email = email
        self.company_name = company_name

    def get_admin_user(self):
        return CreateAdminUserService(
            email=self.email,
            company_name=self.company_name
        ).create()

    def create_capital_call_reviewer(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        capital_call_group = Group.objects.get(name=CAPITAL_CALL_REVIEWER)
        admin_user.groups.add(capital_call_group)

    def create_distribution_notice_reviewer(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        distribution_notice_group = Group.objects.get(name=DISTRIBUTION_NOTICE_REVIEWER)
        admin_user.groups.add(distribution_notice_group)

    def create_knowledgeable_reviewer(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        knowledgeable_group = Group.objects.get(name=KNOWLEDGEABLE_ELIGIBILITY_REVIEWER)
        admin_user.groups.add(knowledgeable_group)

    def create_financial_reviewer(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        knowledgeable_group = Group.objects.get(name=FINANCIAL_ELIGIBILITY_REVIEWER)
        admin_user.groups.add(knowledgeable_group)

    def create_external_reviewer(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        knowledgeable_group = Group.objects.get(name=EXTERNAL_REVIEWER)
        admin_user.groups.add(knowledgeable_group)

    def create_internal_tax_reviewer(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        internal_tax_group = Group.objects.get(name=INTERNAL_TAX_REVIEWER)
        admin_user.groups.add(internal_tax_group)

    def create_compensation_admin(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        compensation_admin_group = Group.objects.get(name=COMPENSATION_ADMIN)
        admin_user.groups.add(compensation_admin_group)

    def create_agreement_reviewer(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        agreement_reviewer_group = Group.objects.get(name=AGREEMENT_REVIEWER)
        admin_user.groups.add(agreement_reviewer_group)

    def create_allocation_reviewer(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        knowledgeable_group = Group.objects.get(name=ALLOCATION_REVIEWER)
        admin_user.groups.add(knowledgeable_group)

    def create_gp_signer(self):
        admin_user = self.get_admin_user()  # type: AdminUser
        if not admin_user:
            print('Unable to get or create admin user')

        general_signer_group = Group.objects.get(name=GENERAL_PARTNER_SIGNER)
        admin_user.groups.add(general_signer_group)

    def create_carry_reviewer(self):
        admin_user = self.get_admin_user()
        if not admin_user:
            print('Unable to get or create admin user')

        carry_reviewer_group = Group.objects.get(name=CARRY_REVIEWER)
        admin_user.groups.add(carry_reviewer_group)
