from django_pglocks import advisory_lock
from rest_framework.generics import get_object_or_404, RetrieveAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.agreements.models import ApplicantAgreementDocument, ApplicationWitness, AgreementDocumentWitness
from api.agreements.serializers import (
    ApplicantAgreementDocumentSerializer, WitnessSerializer, SigningUrlSerializer,
    WitnessRequestorSerializer
)
from api.agreements.services.agreement_review_service import AgreementReview
from api.agreements.services.create_applicant_agreement_documents import CreateApplicantAgreementDocument
from api.agreements.services.internal_tax_review_service import InternalTaxReviewService
from api.agreements.services.singed_response import SignedAgreementResponseService
from api.applications.utils import get_application_or_404
from api.companies.models import CompanyUser
from api.funds.services.application_fund_documents import ApplicationFundDocuments
from api.libs.docusign.services import DocumentSigningService
from api.libs.utils.user_name import get_identifier_from_email, normalize_email
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService


class WitnessListCreateAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = WitnessSerializer
    queryset = ApplicationWitness.objects.all()

    def get_application(self):
        return get_application_or_404({
            'user_id': self.requested_user.id,
            'fund__external_id': self.kwargs['fund_external_id']
        })

    def get_queryset(self):
        application = self.get_application()
        return ApplicationWitness.objects.filter(application=application)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'application': self.get_application(), 'user': self.requested_user})
        return context


class ApplicantDocumentCreateAPIView(CompanyUserViewMixin, APIView):
    def get_application(self):
        return get_application_or_404({
            'user_id': self.requested_user.id,
            'fund__external_id': self.kwargs['fund_external_id']
        })

    def get(self, request, fund_external_id):
        application = self.get_application()
        if not application.is_gp_signed():
            applicant_agreement_service = CreateApplicantAgreementDocument(application=application)
            applicant_agreement_service.create()
            workflow_service = UserOnBoardingWorkFlowService(
                fund=application.fund,
                company_user=applicant_agreement_service.get_company_user(),
                transferred_application_id=application.id if application.is_transferred else None
            )
            workflow_service.get_or_create_agreement_workflow()

        signing_documents = ApplicationFundDocuments(
            application=application
        ).get_documents().values_list(
            'id',
            flat=True
        )
        documents = ApplicantAgreementDocument.objects.filter(
            application=application,
            agreement_document_id__in=list(signing_documents)
        )
        data = ApplicantAgreementDocumentSerializer(documents, many=True).data
        return Response(data)


class GetUserSigningURLAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = SigningUrlSerializer

    def get_object(self):
        applicant_agreement_document_id = self.kwargs.get('applicant_agreement_document_id')
        user = self.requested_user
        applicant_agreement_document = get_object_or_404(
            ApplicantAgreementDocument,
            application__user=user,
            id=applicant_agreement_document_id,
            completed=False
        )

        applicant_document_service = CreateApplicantAgreementDocument(
            application=applicant_agreement_document.application
        )
        envelope_id = applicant_document_service.create_envelope_for_fund_document(
            fund_agreement_document=applicant_agreement_document.agreement_document
        )

        applicant_agreement_document.envelope_id = envelope_id
        applicant_agreement_document.save(update_fields=['envelope_id'])

        company_user = get_object_or_404(
            CompanyUser,
            company=applicant_agreement_document.application.company,
            user=self.requested_user
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


class GetWitnessSigningURLAPIView(CompanyUserViewMixin, RetrieveAPIView):
    permission_classes = ()
    serializer_class = SigningUrlSerializer

    def get_object(self):
        envelope_id = self.kwargs.get('envelope_id')
        uuid = self.kwargs.get('uuid')
        agreement_document_witness = get_object_or_404(
            AgreementDocumentWitness,
            envelope_id=envelope_id,
            uuid=uuid
        )
        envelope_payload = agreement_document_witness.get_witness_details()
        envelope_payload.update({
            "envelope_id": envelope_id,
            "ds_return_url": self.request.query_params['return_url'],
        })
        docusign_service = DocumentSigningService()
        results = docusign_service.send_embedded(envelope_payload)
        return {'signing_url': results['redirect_url']}


class StoreUserSignedResponse(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        envelope_id = self.kwargs.get('envelope_id')
        user = self.requested_user
        applicant_agreement_document = get_object_or_404(
            ApplicantAgreementDocument,
            application__user=user,
            envelope_id=envelope_id
        )
        if applicant_agreement_document.completed:
            return Response({'status': 'success'})

        application = applicant_agreement_document.application
        # AgreementReview(application=applicant_agreement_document.application).process()
        company = application.company
        with advisory_lock(envelope_id, wait=False) as acquired:
            if acquired:
                signed_response_service = SignedAgreementResponseService(
                    envelope_id=envelope_id,
                    instance=applicant_agreement_document,
                    document_title=applicant_agreement_document.agreement_document.document.title,
                    company=company,
                    application=application
                )
                signed_response_service.process()
            else:
                return Response({'status': 'Another request in process'})

        applicant_agreement_document.completed = True
        applicant_agreement_document.save()
        AgreementReview(application=applicant_agreement_document.application).send_signing_completion_email()
        if application.fund.enable_internal_tax_flow:
            InternalTaxReviewService(application=application).start_review()
        else:
            AgreementReview(application=applicant_agreement_document.application).process()

        return Response({'status': 'success'})


class StoreWitnessSignedResponse(APIView):
    # Since witness are not Sidecar user, we have to remove permissions here
    permission_classes = ()

    def get(self, request, *args, **kwargs):
        envelope_id = self.kwargs.get('envelope_id')
        uuid = self.kwargs.get('uuid')

        agreement_document_witness = get_object_or_404(
            AgreementDocumentWitness,
            envelope_id=envelope_id,
            uuid=uuid
        )
        if agreement_document_witness.completed:
            return Response({'status': 'success'})

        application = agreement_document_witness.applicant_agreement_document.application
        AgreementReview(application=agreement_document_witness.applicant_agreement_document.application).process()
        company = application.company
        with advisory_lock(envelope_id, wait=False) as acquired:
            if acquired:
                signed_response_service = SignedAgreementResponseService(
                    envelope_id=envelope_id,
                    instance=agreement_document_witness,
                    document_title=agreement_document_witness.applicant_agreement_document.agreement_document.document.title,
                    company=company,
                    application=application
                )
                signed_response_service.process()
            else:
                return Response({'status': 'Another request in process'})
        return Response({'status': 'success'})


class GetWitnessRequesterDetails(RetrieveAPIView):
    # Since witness are not Sidecar user, we have to remove permissions here
    permission_classes = ()
    serializer_class = WitnessRequestorSerializer

    def get_object(self):
        uuid = self.kwargs.get('uuid')
        return get_object_or_404(
            AgreementDocumentWitness.objects.select_related(
                'applicant_agreement_document',
                'applicant_agreement_document__application',
                'applicant_agreement_document__application__kyc_record',
            ),
            uuid=uuid
        )
