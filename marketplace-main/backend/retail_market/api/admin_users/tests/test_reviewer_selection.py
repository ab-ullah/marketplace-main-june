from django.contrib.auth.models import Group

from api.admin_users.selectors.select_reviewers import select_random_reviewer_by_group
from api.partners.tests.factories import AdminUserFactory
from api.users.constants import KNOWLEDGEABLE_ELIGIBILITY_REVIEWER
from core.base_tests import BaseTestCase


class TestReviewerSelection(BaseTestCase):

    def setUp(self):
        self.create_company()

    def test_deleted_users_not_selected_as_reviewer(self):
        knowledgeable_group, _ = Group.objects.get_or_create(name=KNOWLEDGEABLE_ELIGIBILITY_REVIEWER)

        admin_user_1 = AdminUserFactory(company=self.company)
        admin_user_2 = AdminUserFactory(company=self.company)

        admin_user_1.groups.add(knowledgeable_group)
        admin_user = select_random_reviewer_by_group(
            company=self.company,
            group_name=KNOWLEDGEABLE_ELIGIBILITY_REVIEWER
        )
        self.assertEqual(admin_user.id, admin_user_1.id)

        admin_user_1.user.deleted = True
        admin_user_1.user.save()

        admin_user = select_random_reviewer_by_group(
            company=self.company,
            group_name=KNOWLEDGEABLE_ELIGIBILITY_REVIEWER
        )
        self.assertIsNone(admin_user)

        admin_user_2.groups.add(knowledgeable_group)
        admin_user = select_random_reviewer_by_group(
            company=self.company,
            group_name=KNOWLEDGEABLE_ELIGIBILITY_REVIEWER
        )
        self.assertEqual(admin_user.id, admin_user_2.id)
