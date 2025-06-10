from rest_framework import status
from rest_framework.generics import ListAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.documents.models import TaxDocument
from api.funds.models import Fund
from api.libs.docusign.services import DocumentSigningService
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.tax_records import serializers
from api.tax_records.models import TaxForm


class TaxFormListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = serializers.TaxFormSerializer

    def get_queryset(self):
        fund = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company_id__in=self.company_ids,
        )
        return TaxForm.objects.filter(company_id=fund.company)


class SigningURLAPIView(CompanyUserViewMixin, APIView):
    lookup_field = "envelope_id"

    def get(self, request, envelope_id):
        tax_document = TaxDocument.objects.get(envelope_id=envelope_id)

        if tax_document.owner != self.requested_user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        envelope_args = {
            "signer_email": self.requested_user.email,
            "signer_name": self.requested_user.full_name or self.requested_user.email,
            "signer_client_id": self.requested_user.id,
            "envelope_id": envelope_id,
            "ds_return_url": request.query_params['return_url'],
        }
        docusign_service = DocumentSigningService()
        results = docusign_service.send_embedded(envelope_args)
        attrs = {'signing_url': results['redirect_url']}
        return Response(attrs)
