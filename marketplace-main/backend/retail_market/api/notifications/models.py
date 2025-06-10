import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _

from api.models import BaseModel
from api.notifications.managers import PublishedFundUserNotificationManager


class UserNotification(BaseModel):
    class NotificationTypeChoice(models.IntegerChoices):
        NEW_INVESTMENT = 1, _('New Investment')
        CAPITAL_CALL = 2, _('Capital Call')
        PURCHASE_OFFER = 3, _('Purchase Offer')
        QUARTERLY_STATEMENT = 4, _('Quarterly Statement')
        PURCHASE_CONFIRMATION = 5, _('Purchase Confirmation')
        PROSPECTUS = 6, _('Prospectus')
        AGREEMENT = 7, _('Agreement')
        INTEREST_STATEMENT = 8, _('Interest Statement')
        NAV_STATEMENT = 9, _('Nav Statement')
        PITCH_BOOK = 10, _('Pitch Book')
        TAX = 11, _('Tax')
        OTHER = 12, _('Other')
        DISTRIBUTIONS = 13, _('Distributions')
        INVESTOR_REPORTS = 14, _('Investor Reports')
        FINANCIAL_STATEMENTS = 15, _('Financial Statements')
        PURCHASED_AGREEMENTS = 16, _('Purchased Agreements')
        SUBSCRIPTION_DOCUMENTS = 17, _('Subscription Documents')
        FINANCIAL_INFORMATION = 18, _("Financial Information")
        PROPERTY_PORTFOLIO = 19, _("Property Portfolio")
        QUARTERLY_REPORT = 20, _("Quarterly Report")
        ETHICS = 21, _("Ethics")
        INVESTOR_MEETING_MATERIALS = 22, _("Investor Meeting Materials")
        STRATEGIC_MATERIALS = 23, _("Strategic Materials")
        SUSTAINABILITY = 24, _("Sustainability")
        ANNUAL_REPORT = 35, _("Annual Report")
        MONTHLY_REPORT = 36, _("Monthly Report")
        COMPANY_DOCUMENT = 37, _("Company Document")
        FUND_DOCUMENT = 38, _("Fund Document")
        APPLICATION = 39, _("Application")

        @classmethod
        def get_value_from_label(cls, label):
            try:
                return next(
                    key for key, value in cls.choices
                    if value == label
                )
            except StopIteration:
                raise ValueError(f"No choice with label '{label}' found")

    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.SET_NULL,
        related_name='company_user_notifications',
        null=True,
        blank=True
    )
    investor = models.ForeignKey(
        'investors.Investor',
        on_delete=models.SET_NULL,
        related_name='investor_notifications',
        null=True,
        blank=True
    )
    is_read = models.BooleanField(default=False)
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE)
    document_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    notification_type = models.PositiveSmallIntegerField(choices=NotificationTypeChoice.choices)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    capital_call = models.ForeignKey(
        'capital_calls.CapitalCall',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='capital_call_notification'
    )
    fund_capital_call = models.ForeignKey(
        'capital_calls.FundCapitalCall',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='fund_capital_call_notification'
    )
    documents = models.ManyToManyField('documents.Document', through='NotificationDocument')
    deleted = models.BooleanField(default=False)
    is_admin_upload = models.BooleanField(default=False)
    application = models.OneToOneField(
        'applications.Application',
        on_delete=models.CASCADE,
        null=True,
        related_name='application_notification'
    )

    def get_full_name(self):
        if self.investor is not None:
            return self.investor.name
        return self.user.user.get_full_name()

    def get_fund_name(self):
        if self.fund:
            return self.fund.name
        return ""


class NotificationDocument(BaseModel):
    notification = models.ForeignKey(
        'UserNotification',
        on_delete=models.CASCADE,
        related_name='notification_documents'
    )
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='document_notifications'
    )

    def get_full_name(self):
        return self.notification.get_full_name()


class PublishedFundUserNotification(UserNotification):
    objects = PublishedFundUserNotificationManager()

    class Meta:
        proxy = True
