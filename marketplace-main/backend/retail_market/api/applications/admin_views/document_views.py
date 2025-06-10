from django.utils import timezone
from django_pglocks import advisory_lock
from rest_framework.generics import (
    RetrieveAPIView, get_object_or_404, ListCreateAPIView, RetrieveUpdateDestroyAPIView, UpdateAPIView, ListAPIView,
    CreateAPIView
)
from rest_framework.response import Response
from rest_framework.views import APIView

from api.agreements.serializers import SigningUrlSerializer
from api.applications.admin_views.serializers import ApplicationCompanyDocumentCreationSerializer, \
    ApplicationCompanyDocumentUpdateSerializer
from api.applications.models import ApplicationCompanyDocument, Application
from api.applications.serializers import SupportingDocumentSerializer, ApplicationCompanyDocumentSerializer
from api.applications.services.create_application_company_documents import ApplicationCompanyDocumentsService
from api.applications.services.store_signed_response import SignedCompanyDocumentResponseService
from api.documents.models import ApplicationSupportingDocument
from api.libs.docusign.services import DocumentSigningService
from api.libs.utils.user_name import normalize_email, get_identifier_from_email
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.workflows.models import Task
from api.workflows.services.approval_service import WorkFlowApprovalService


class ApplicationCompanyDocumentListAPIView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def get(self, request, application_id, *args, **kwargs):
        application = get_object_or_404(
            Application.active_applications,
            id=application_id,
            company_id=self.company,
        )
        documents_data = ApplicationCompanyDocumentsService(application=application).get_documents()
        return Response(documents_data)


class ExistingApplicationCompanyDocumentListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ApplicationCompanyDocumentSerializer

    def get_queryset(self):
        application_id = self.kwargs['application_id']
        application = get_object_or_404(
            Application.active_applications,
            id=application_id,
            company_id=self.company,
        )
        return ApplicationCompanyDocumentsService(application=application).get_existing_include_deleted_documents()


class ApplicationCompanyCreateAPIView(AdminViewMixin, CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ApplicationCompanyDocumentCreationSerializer

    def get_queryset(self):
        return ApplicationCompanyDocument.objects.filter(company_document__company=self.company)


class ApplicationCompanyDocumentUpdateAPIView(AdminViewMixin, UpdateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ApplicationCompanyDocumentUpdateSerializer

    def get_queryset(self):
        return ApplicationCompanyDocument.objects.filter(
            company_document__company=self.company,
            application__company=self.company
        )


class GetGPSigningURLAPIView(AdminViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = SigningUrlSerializer

    def get_object(self):
        envelope_id = self.kwargs.get('envelope_id')
        get_object_or_404(
            ApplicationCompanyDocument,
            company_document__gp_signer_id=self.admin_user.id,
            application__fund__external_id=self.kwargs['fund_external_id'],
            envelope_id=envelope_id
        )
        gp_signer_user = self.admin_user.user

        envelope_payload = {
            "signer_email": normalize_email(gp_signer_user.email),
            "signer_name": get_identifier_from_email(gp_signer_user),
            "signer_client_id": gp_signer_user.id,
            "envelope_id": envelope_id,
            "ds_return_url": self.request.query_params['return_url'],
        }

        docusign_service = DocumentSigningService()
        results = docusign_service.send_embedded(envelope_payload)
        return {'signing_url': results['redirect_url']}


class StoreGPSignedResponse(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def get(self, request, *args, **kwargs):
        envelope_id = self.kwargs.get('envelope_id')
        applicant_company_document = get_object_or_404(
            ApplicationCompanyDocument,
            company_document__gp_signer_id=self.admin_user.id,
            application__fund__external_id=self.kwargs['fund_external_id'],
            envelope_id=envelope_id
        )

        if applicant_company_document.gp_signing_complete:
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
                    application=application,
                    gp_signing_completed=True
                )
                signed_response_service.process()
            else:
                return Response({'status': 'Another request in process'})

        applicant_company_document.gp_signing_complete = True
        applicant_company_document.completed = True
        applicant_company_document.save()

        if applicant_company_document.task:
            task = applicant_company_document.task
            task.status = Task.StatusChoice.APPROVED
            task.approver = self.admin_user
            task.approval_date = timezone.now()
            task.completed = True
            task.save(update_fields=["status", "completed", "approver", "approval_date"])
            WorkFlowApprovalService().process_gp_signing_workflow(
                workflow=task.workflow,
                skip_email=True
            )

        return Response({'status': 'success'})


class SupportingDocumentView(AdminViewMixin, ListCreateAPIView):
    serializer_class = SupportingDocumentSerializer

    def get_queryset(self):
        return ApplicationSupportingDocument.objects.filter(
            application_id=self.kwargs['application_id'], deleted=False
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['application_id'] = self.kwargs['application_id']
        return context


class SupportingDocumentRetrieveUpdateDestroyView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = SupportingDocumentSerializer

    def get_queryset(self):
        return ApplicationSupportingDocument.objects.filter(
            id=self.kwargs['pk'], application_id=self.kwargs['application_id'], deleted=False
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['application_id'] = self.kwargs['application_id']
        return context
