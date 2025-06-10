import os
from uuid import uuid4

from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from api.models import BaseModel, IMAGE_EXTENTIONS


def fund_marketing_page_background_path(instance, filename):
    return 'marketing_page/funds/background-images/{uuid}/{filename}'.format(
        company_id=instance.id,
        uuid=uuid4().hex,
        filename=filename,
    )


def fund_marketing_page_logo_path(instance, filename):
    return 'marketing_page/funds/logo/{uuid}/{filename}'.format(
        company_id=instance.id,
        uuid=uuid4().hex,
        filename=filename,
    )


def fund_marketing_promo_file_path(instance, filename):
    return 'marketing_page/funds/promo-material/{uuid}/{filename}'.format(
        company_id=instance.id,
        uuid=uuid4().hex,
        filename=filename,
    )


def icon_option_icon_path(instance, filename):
    return 'marketing_page/icon-options/icon/{uuid}/{filename}'.format(
        company_id=instance.id,
        uuid=uuid4().hex,
        filename=filename,
    )


class FundMarketingPage(BaseModel):
    class MarketingPageStatus(models.IntegerChoices):
        DRAFT = 1, _('Draft')
        PENDING_APPROVAL = 2, _('Pending Approval')
        APPROVED = 3, _('Approved')

    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name='fund_marketing_pages')
    title = models.TextField(null=True, blank=True)
    sub_header = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    background_image = models.FileField(upload_to=fund_marketing_page_background_path,
                                         null=True,
                                         blank=True,
                                         validators=[FileExtensionValidator(IMAGE_EXTENTIONS)])
    logo = models.FileField(upload_to=fund_marketing_page_logo_path,
                             null=True,
                             blank=True,
                             validators=[FileExtensionValidator(IMAGE_EXTENTIONS)])
    status = models.PositiveSmallIntegerField(
        choices=MarketingPageStatus.choices,
        default=MarketingPageStatus.DRAFT.value
    )
    created_by = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        related_name='created_marketing_pages',
        null=True,
        blank=True
    )


class FundMarketingPageContact(BaseModel):
    fund_marketing_page = models.OneToOneField(
        'FundMarketingPage',
        on_delete=models.CASCADE,
        related_name='fund_contact'
    )
    email = models.EmailField(null=True, blank=True)


class FundMarketingPageReviewer(BaseModel):
    fund_marketing_page = models.ForeignKey(
        'FundMarketingPage',
        on_delete=models.CASCADE,
        related_name='fund_marketing_page_reviewers'
    )
    reviewer = models.ForeignKey('admin_users.AdminUser', on_delete=models.CASCADE)
    approved = models.BooleanField(default=False)


class PromoFile(BaseModel):
    class PromoFileType(models.IntegerChoices):
        IMAGE = 1, _('Image')
        VIDEO = 2, _('Video')

    fund_marketing_page = models.ForeignKey(
        'FundMarketingPage',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='fund_page_promo_files'
    )
    promo_file = models.FileField(
        upload_to=fund_marketing_promo_file_path
    )
    file_type = models.PositiveSmallIntegerField(
        choices=PromoFileType.choices
    )


class FundFact(BaseModel):
    fund_marketing_page = models.ForeignKey(
        'FundMarketingPage',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='fund_facts'
    )
    title = models.CharField(max_length=250, null=True, blank=True)
    data = models.TextField(null=True, blank=True)


class FundPageDocument(BaseModel):
    fund_marketing_page = models.ForeignKey(
        'FundMarketingPage',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='fund_page_documents'
    )
    document = models.ForeignKey('documents.Document', on_delete=models.CASCADE, related_name='document_fund_pages')


class RequestAllocationCriteria(BaseModel):
    fund_marketing_page = models.ForeignKey(
        'FundMarketingPage',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='request_allocation_criteria'
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    investment_amount = models.DecimalField(max_digits=13, decimal_places=3, default=0)


class RequestAllocationDocument(BaseModel):
    allocation_criteria = models.ForeignKey(
        'RequestAllocationCriteria',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='allocation_documents'
    )
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='document_allocation_criteria'
    )


class IconOption(BaseModel):
    name = models.CharField(max_length=250)
    icon = models.FileField(upload_to=icon_option_icon_path,
                             validators=[FileExtensionValidator(IMAGE_EXTENTIONS)])


class FooterBlock(BaseModel):
    fund_marketing_page = models.ForeignKey(
        'FundMarketingPage',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='footer_blocks'
    )
    title = models.CharField(max_length=250, null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    icon = models.ForeignKey(
        'IconOption',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='icon_footer_blocks'
    )
