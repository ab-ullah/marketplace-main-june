from rest_framework.generics import get_object_or_404, ListAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.applications.utils import get_application_or_404, update_or_create_user_application_state
from api.companies.models import CompanyUser
from api.documents.models import CompanyDataProtectionPolicyDocument, PublicFundDocument
from api.funds.models import Fund, FundDocumentResponse
from api.funds.serializers import FundDocumentSerializer, FundDocumentResponseSerializer, \
    FundDataProtectionPolicyDocumentSerializer, PublicFundDocumentSerializer
from api.funds.services.application_fund_documents import ApplicationFundDocuments
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.permissions.document_permission import HasDocumentAccessPermission


class FundDocumentListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = FundDocumentSerializer

    def get_queryset(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company_id__in=self.company_ids
        )

        application = get_application_or_404({
            'fund__external_id': fund.external_id,
            'company': fund.company,
            'user_id': self.requested_user.id
        })
        return ApplicationFundDocuments(application=application).get_documents(
            require_signature=False,
            require_acknowledgement=True
        )


class FundDocumentResponseCreateView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = FundDocumentResponseSerializer

    def get_fund(self):
        return get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company_id__in=self.company_ids
        )

    def get_company_user(self, fund):
        return CompanyUser.objects.get(user=self.requested_user, company=fund.company)

    def get_serializer_context(self):
        fund = self.get_fund()
        company_user = self.get_company_user(fund=fund)
        context = super().get_serializer_context()
        context['company_user'] = company_user
        context['fund'] = fund
        return context

    def get_queryset(self):
        fund = self.get_fund()
        company_user = self.get_company_user(fund=fund)
        return FundDocumentResponse.objects.filter(
            fund__external_id=self.kwargs['fund_external_id'],
            fund__company_id__in=self.company_ids,
            user=company_user
        )


class FundDataProtectionPolicyDocumentListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = FundDataProtectionPolicyDocumentSerializer

    def get_queryset(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
        )
        return CompanyDataProtectionPolicyDocument.objects.filter(company=fund.company).prefetch_related('document')


class FundDataProtectionPolicyView(CompanyUserViewMixin, APIView):

    def post(self, request, *args, **kwargs):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id']
        )

        values = {
            'is_data_protection_policy_agreed': request.data['is_data_protection_policy_agreed']
        }
        application, _ = update_or_create_user_application_state(user=self.requested_user, fund=fund, values=values)

        return Response({'status': 'success'})


class PublicFundDocumentListView(CompanyUserViewMixin, ListAPIView):
    serializer_class = PublicFundDocumentSerializer
    permission_classes = (HasDocumentAccessPermission,)

    def get_queryset(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id']
        )
        return PublicFundDocument.objects.filter(fund=fund)
