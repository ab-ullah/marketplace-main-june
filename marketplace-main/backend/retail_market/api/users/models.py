from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import UnicodeUsernameValidator, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords

from api.models import BaseModel
from api.users.managers import UserManager


class RetailUser(AbstractBaseUser, PermissionsMixin, BaseModel):
    """
    An abstract base class implementing a fully featured User model with
    admin-compliant permissions.

    Email and password are required. Other fields are optional.
    """

    class UserInviteStatusChoices(models.IntegerChoices):
        INVITED = 1, _('Invited')
        ACCEPTED_INVITE = 2, _('Accepted Invite')

    history = HistoricalRecords()
    username_validator = UnicodeUsernameValidator()

    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        db_index=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        validators=[username_validator],
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )
    email = models.EmailField(
        _('email address'),
        unique=True,
        blank=True,
        null=True,
        db_index=True
    )
    full_name = models.CharField(_('full name'), max_length=150, blank=True, null=True)
    first_name = models.CharField(_('first name'), max_length=150, blank=True, null=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True, null=True)
    bio = models.CharField(_('Quick Bio'), max_length=150, blank=True, null=True)
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.'),
    )
    is_sidecar_admin = models.BooleanField(
        _('is sidecar admin'),
        default=False,
        help_text=_('Designates whether the user is a sidecar admin.'),
    )
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )
    last_active = models.DateTimeField(_('last_active'), null=True, blank=True)
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    first_login_at = models.DateTimeField(_('first login at'), null=True, blank=True)
    is_invited = models.BooleanField(_('is invited'), default=False)
    deleted = models.BooleanField(default=False, db_index=True)
    invite_status = models.PositiveSmallIntegerField(
        choices=UserInviteStatusChoices.choices,
        null=True,
        blank=True
    )
    is_advisor = models.BooleanField(_('is advisor'), default=False)

    objects = UserManager()
    include_deleted = BaseUserManager()

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'username'

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        if self.full_name:
            return self.full_name
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

    def __str__(self):
        return self.email

    def has_full_access(self):
        if not hasattr(self, 'admin_user'):
            return False

        return self.admin_user.has_full_access()

    def has_compensation_access(self):
        if not hasattr(self, 'admin_user'):
            return False

        return self.admin_user.has_compensation_access()

    def is_admin_user(self):
        return hasattr(self, 'admin_user')

    def employment_record(self):
        participant_profile = getattr(self, 'user_participant_profile', None)
        employment_record = getattr(participant_profile, 'employment_record', None)
        return employment_record
