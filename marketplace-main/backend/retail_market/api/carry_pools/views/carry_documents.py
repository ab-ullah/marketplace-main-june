from django.shortcuts import get_object_or_404
from django_pglocks import advisory_lock
from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.agreements.serializers import SigningUrlSerializer
from api.carry_pools.models import ParticipantCarryDocument
from api.carry_pools.serializers import CarryDocumentParticipantSerializer
from api.carry_pools.services.carry_signed_response import CarrySignedResponseService
from api.carry_pools.services.create_participant_carry_documents import CreateParticipantCarryDocument
from api.carry_pools.services.investor_carry_documents import InvestorCarryDocumentService
from api.companies.models import CompanyUser
from api.libs.docusign.services import DocumentSigningService
from api.libs.utils.user_name import normalize_email, get_identifier_from_email
from api.mixins.company_user_mixin import CompanyUserViewMixin


class PendingDocumentsCountAPIView(CompanyUserViewMixin, APIView):

    def get(self, request):
        pending_counts = InvestorCarryDocumentService(
                companies=self.companies,
                company_users=self.company_users
            ).pending_documents_count()
        return Response(pending_counts, status=status.HTTP_200_OK)


class ParticipantCarryDocumentUpdateAPIView(CompanyUserViewMixin, RetrieveUpdateAPIView):
    serializer_class = CarryDocumentParticipantSerializer

    def get_queryset(self):
        return ParticipantCarryDocument.objects.filter(
            company__in=self.company_ids
        )


class GetUserSigningURLAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = SigningUrlSerializer

    def get_object(self):
        participant_carry_document_id = self.kwargs.get('participant_carry_document_id')
        user = self.request.user
        participant_carry_document = get_object_or_404(
            ParticipantCarryDocument,
            user=user,
            id=participant_carry_document_id,
            completed=False
        )

        participant_document_service = CreateParticipantCarryDocument(
            participant_carry_document=participant_carry_document
        )
        envelope_id = participant_document_service.create_envelope_for_carry_document(
            carry_template_document=participant_carry_document.carry_document
        )

        participant_carry_document.envelope_id = envelope_id
        participant_carry_document.save(update_fields=['envelope_id'])

        company_user = get_object_or_404(
            CompanyUser,
            company=participant_carry_document.company,
            user=self.request.user
        )

        envelope_payload = {
            "signer_email": normalize_email(user.email),
            "signer_name": get_identifier_from_email(user),
            "signer_client_id": company_user.id,
            "envelope_id": envelope_id,
            "ds_return_url": self.request.query_params['return_url'].replace('envelopeId', envelope_id),
        }

        docusign_service = DocumentSigningService()
        results = docusign_service.send_embedded(envelope_payload)
        return {'signing_url': results['redirect_url']}


class StoreUserSignedResponse(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        envelope_id = self.kwargs.get('envelope_id')
        user = self.request.user
        participant_carry_document = get_object_or_404(
            ParticipantCarryDocument,
            user=user,
            envelope_id=envelope_id
        )
        if participant_carry_document.completed:
            return Response({'status': 'success'})

        company = participant_carry_document.company
        with advisory_lock(envelope_id, wait=False) as acquired:
            if acquired:
                signed_response_service = CarrySignedResponseService(
                    envelope_id=envelope_id,
                    instance=participant_carry_document,
                    document_title=participant_carry_document.carry_document.document.title,
                    company=company
                )
                signed_response_service.process()
            else:
                return Response({'status': 'Another request in process'})

        participant_carry_document.completed = True
        participant_carry_document.save()
        return Response({'status': 'success'})
