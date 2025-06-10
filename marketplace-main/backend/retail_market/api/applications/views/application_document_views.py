from django_pglocks import advisory_lock
from rest_framework.generics import get_object_or_404, UpdateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.agreements.serializers import SigningUrlSerializer
from api.applications.models import Application, ApplicationCompanyDocument
from api.applications.serializers import ApplicationCompanyDocumentSerializer
from api.applications.services.create_application_company_documents import ApplicationCompanyDocumentsService
from api.applications.services.mark_required_once_documents_as_deleted import MarkRequiredOnceDocumentAsDeleted
from api.applications.services.store_signed_response import SignedCompanyDocumentResponseService
from api.applications.utils import get_application_or_404
from api.companies.models import CompanyUser
from api.funds.services.gp_signing_service import GPSigningService
from api.libs.docusign.services import DocumentSigningService
from api.libs.utils.user_name import normalize_email, get_identifier_from_email
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService


class ApplicationCompanyDocumentListAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, fund_external_id,skip_completed_required_docs, *args, **kwargs):
        skip_complete_once_required_docs = True if skip_completed_required_docs == 'true' else False
        application = get_application_or_404({
            'fund__external_id': fund_external_id,
            'company_id__in': self.company_ids,
            'user_id': self.requested_user.id
        })
        documents_data = ApplicationCompanyDocumentsService(application=application).get_documents(skip_complete_once_required_docs=skip_complete_once_required_docs)
        return Response(documents_data)


class ApplicationCompanyDocumentUpdateAPIView(CompanyUserViewMixin, UpdateAPIView):
    serializer_class = ApplicationCompanyDocumentSerializer

    def get_queryset(self):
        application = get_application_or_404({
            'fund__external_id': self.kwargs['fund_external_id'],
            'company_id__in': self.company_ids,
            'user_id': self.requested_user.id
        })
        return ApplicationCompanyDocument.objects.filter(application=application, company_document__deleted=False)


class GetUserSigningURLAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = SigningUrlSerializer

    def get_object(self):
        applicant_company_document_id = self.kwargs.get('applicant_company_document_id')
        user = self.requested_user
        applicant_company_document = get_object_or_404(
            ApplicationCompanyDocument,
            application__user=user,
            application__fund__external_id=self.kwargs['fund_external_id'],
            id=applicant_company_document_id
        )
        company_user = get_object_or_404(
            CompanyUser,
            company=applicant_company_document.application.company,
            user=user
        )

        applicant_company_document_service = ApplicationCompanyDocumentsService(
            application=applicant_company_document.application
        )
        envelope_id = applicant_company_document_service.create_docusign_envelope(
            company_document=applicant_company_document.company_document
        )

        applicant_company_document.envelope_id = envelope_id
        applicant_company_document.save(update_fields=['envelope_id'])

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
        user = self.requested_user
        applicant_company_document = get_object_or_404(
            ApplicationCompanyDocument,
            application__user=user,
            application__fund__external_id=self.kwargs['fund_external_id'],
            envelope_id=envelope_id
        )
        if applicant_company_document.completed:
            return Response({'status': 'success'})

        application = applicant_company_document.application
        company = application.company
        with advisory_lock(envelope_id, wait=False) as acquired:
            if acquired:
                signed_response_service = SignedCompanyDocumentResponseService(
                    envelope_id=envelope_id,
                    instance=applicant_company_document,
                    document_title=applicant_company_document.company_document.name,
                    company=company,
                    application=application
                )
                signed_response_service.process()
            else:
                return Response({'status': 'Another request in process'})

        applicant_company_document.completed = True
        applicant_company_document.save()

        MarkRequiredOnceDocumentAsDeleted.process(application_company_document=applicant_company_document)

        if applicant_company_document.company_document.require_gp_signature and not applicant_company_document.task:
            on_boarding_workflow_service = UserOnBoardingWorkFlowService(
                fund=application.fund,
                company_user=None,
                transferred_application_id=application.id if application.is_transferred else None
            )
            gp_signing_workflow = on_boarding_workflow_service.get_or_create_gp_signing_workflow(application.workflow)
            task = GPSigningService(
                fund=application.fund,
                workflow=gp_signing_workflow,
                application=application
            ).create_applicant_company_document_task(
                applicant_company_document=applicant_company_document
            )
            applicant_company_document.task = task
            applicant_company_document.save(update_fields=['task'])

        return Response({'status': 'success'})
