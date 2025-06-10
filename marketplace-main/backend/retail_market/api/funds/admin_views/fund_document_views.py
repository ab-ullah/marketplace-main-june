import json

from rest_framework.generics import CreateAPIView, ListAPIView, get_object_or_404, UpdateAPIView, ListCreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response

from api.agreements.services.application_data.applicant_details import ApplicantOptions
from api.agreements.services.application_data.carry_document_details import CarryDocumentsOptions
from api.applications.models import Application
from api.documents.models import FundDocument, PublicFundDocument
from api.funds.models import Fund, FundDocumentResponse
from api.funds.serializers import (
    FundDocumentSerializer, FundDocumentCreateSerializer, FundDocumentResponseSerializer, PublicFundDocumentSerializer
)
from api.funds.services.application_fund_documents import ApplicationFundDocuments
from api.agreements.services.application_data.aml_kyc_details import AmlKycOptions
from api.agreements.services.application_data.fund_document_details import FundDocumentsDetails
from api.agreements.services.application_data.application_details import ApplicationOptions
from api.agreements.services.application_data.eligibility_criteria_details import EligibilityCriteriaOptions
from api.agreements.services.application_data.investment_amount_details import InvestmentAmountOptions
from api.agreements.services.application_data.payment_details import PaymentDetailOptions
from api.agreements.services.application_data.tax_details import TaxDetailOptions
from api.agreements.services.application_data.transfer_details import TransferDetailOption
from api.agreements.services.application_data.carry_allocation_data import ParticipantCarryDocumentOptions
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class FundDocumentCreateAPIView(AdminViewMixin, CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundDocumentCreateSerializer

    def get_queryset(self):
        return FundDocument.objects.filter(company=self.company)


class FundDocumentListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundDocumentSerializer

    def get_queryset(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company=self.company
        )
        return FundDocument.objects.filter(fund=fund, document__company=self.company, require_acknowledgement=True)


class ApplicationFundDocumentListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundDocumentSerializer

    def get_queryset(self):
        application = get_object_or_404(
            Application,
            pk=self.kwargs['application_id'],
            company=self.company
        )
        return ApplicationFundDocuments(application=application).get_documents(require_signature=False,
                                                                               require_acknowledgement=True)


class FundDocumentUpdateAPIView(AdminViewMixin, UpdateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundDocumentSerializer

    def get_queryset(self):
        return FundDocument.objects.filter(
            document__company=self.company
        )


class FundDocumentResponseListView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundDocumentResponseSerializer

    def get_queryset(self):
        application = get_object_or_404(
            Application,
            pk=self.kwargs['application_id'],
            company=self.company
        )
        return FundDocumentResponse.objects.filter(
            fund_id=application.fund_id,
            user__user_id=application.user_id
        )


class FundDocumentFieldsView(AdminViewMixin, APIView):

    def get(self, request, *args, **kwargs):
        external_id = kwargs['fund_external_id']
        fund = get_object_or_404(Fund, external_id=external_id)
        eligibility_criteria_fields = EligibilityCriteriaOptions().get_fields(fund=fund)
        aml_kyc_fields = AmlKycOptions().get_fields()
        banking_detail_fields = PaymentDetailOptions().get_fields()
        tax_detail_fields = TaxDetailOptions().get_fields()
        investment_amount_fields = InvestmentAmountOptions().get_fields()
        application_fields = ApplicationOptions().get_fields()
        gp_signer_fields = FundDocumentsDetails().get_document_fields()
        applicant_fields = ApplicantOptions().get_fields()
        transfer_fields = TransferDetailOption().get_fields()
        participant_carry_documents_fields = ParticipantCarryDocumentOptions().get_fields()
        carry_documents_fields = CarryDocumentsOptions().get_fields()
        documents_filter = None
        if hasattr(fund, 'document_filter'):
            documents_filter = fund.document_filter.code

        available_fields = {
            'fields': {
                'banking_details': banking_detail_fields,
                'tax_details': tax_detail_fields,
                'aml_kyc_details': aml_kyc_fields,
                'eligibility_criteria_details': eligibility_criteria_fields,
                'investment_amount_details': investment_amount_fields,
                'application_details': application_fields,
                'gp_signer_details': gp_signer_fields,
                'applicant_fields': applicant_fields,
                'transfer_fields': transfer_fields,
                'carry_management_participant_Fields': participant_carry_documents_fields,
                'carry_management_documents_fields': carry_documents_fields
            },
            'documents_filter': documents_filter
        }
        return Response(json.dumps(available_fields, indent=4, sort_keys=True))


class PublicFundDocumentListCreateView(AdminViewMixin, ListCreateAPIView):
    serializer_class = PublicFundDocumentSerializer

    def get_queryset(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company=self.company
        )
        return PublicFundDocument.objects.filter(fund=fund)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['fund_external_id'] = self.kwargs['fund_external_id']
        return context
