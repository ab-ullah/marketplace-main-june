from django.contrib.auth.models import Group
from django.db import models

from core.managers.has_company_filter_manager import HasCompanyFilterManager
from api.models import BaseModel
from django.utils.translation import gettext_lazy as _

from api.users.constants import ADMIN_GROUP_NAME, COMPENSATION_ADMIN


class AdminUser(BaseModel):
    objects = HasCompanyFilterManager()

    user = models.OneToOneField(
        'users.RetailUser',
        on_delete=models.CASCADE,
        related_name='admin_user'
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_admin_users'
    )
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        help_text=_(
            'The groups this Admin belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
        related_name="group_admin_users",
        related_query_name="admin_user",
    )

    title = models.CharField(default='General Partner Signer', max_length=120, blank=True, null=True)

    def has_full_access(self):
        return self.groups.filter(name=ADMIN_GROUP_NAME).exists()

    def has_compensation_access(self):
        return self.groups.filter(name=COMPENSATION_ADMIN).exists()
