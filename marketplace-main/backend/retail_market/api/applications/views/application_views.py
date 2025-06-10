from rest_framework import generics
from rest_framework.generics import get_object_or_404, ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.applications.admin_views.serializers import ApplicationDocumentRequestsSerializer
from api.applications.models import Application, UserApplicationState
from api.applications.models import ApplicationDocumentsRequests
from api.applications.serializers import ApplicationSerializer, ApplicationRequestDocumentSerializer, \
    ApplicationUpdateSerializer, UserApplicationStateSerializer, ApplicationDefaultsSerializer
from api.applications.services.resubmit_application_tasks import ApplicationChangeRequests
from api.applications.utils import get_application_or_404
from api.documents.models import ApplicationRequestDocument, TaxDocument
from api.funds.models import Fund
from api.funds.services.fund_application_statuses import FundApplicationsStatusService
from api.investors.services.investor_application_started_status import InvestorApplicationsStatusService
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.workflows.models import WorkFlow, Task


class ApplicationListAPIView(CompanyUserViewMixin, generics.ListAPIView):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(
            fund__external_id=self.kwargs['fund_external_id'],
            user=self.requested_user,
            company_id__in=self.company_ids
        ).order_by('-created_at')


class ApplicationDefaultsAPIView(CompanyUserViewMixin, generics.RetrieveAPIView):
    serializer_class = ApplicationDefaultsSerializer

    def get_object(self):
        return get_application_or_404({
            'fund__external_id': self.kwargs['fund_external_id'],
            'user_id': self.requested_user.id,
            'company_id__in': self.company_ids
        })


class ApplicationCreateAPIView(CompanyUserViewMixin, generics.CreateAPIView):
    serializer_class = ApplicationSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.requested_user
        context['company_ids'] = self.company_ids
        return context


class ApplicationUpdateAPIView(CompanyUserViewMixin, generics.UpdateAPIView):
    serializer_class = ApplicationSerializer
    lookup_field = 'uuid'

    def get_queryset(self):
        return Application.objects.filter(
            uuid=self.kwargs['uuid'],
            user=self.requested_user,
            company_id__in=self.company_ids
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.requested_user
        context['company_ids'] = self.company_ids
        return context


class ApplicationBaseUpdateAPIView(CompanyUserViewMixin, generics.UpdateAPIView):
    serializer_class = ApplicationUpdateSerializer
    lookup_field = 'uuid'

    def get_queryset(self):
        return Application.objects.filter(
            uuid=self.kwargs['uuid'],
            user=self.requested_user,
            company_id__in=self.company_ids
        )


class ApplicationDocumentsRequestsListView(CompanyUserViewMixin, generics.ListAPIView):
    serializer_class = ApplicationDocumentRequestsSerializer

    def get_queryset(self):
        return ApplicationDocumentsRequests.objects.filter(
            application_id=self.kwargs['application_id']
        ).prefetch_related('application')


class ApplicationDocumentRequestResponse(CompanyUserViewMixin, generics.ListCreateAPIView):
    serializer_class = ApplicationRequestDocumentSerializer

    def get_queryset(self):
        application_document_requests = ApplicationDocumentsRequests.objects.filter(
            application_id=self.kwargs['application_id'])
        return ApplicationRequestDocument.objects.filter(application_document_request__in=application_document_requests)


class ApplicationDocumentRequestResponseDestroyView(CompanyUserViewMixin, generics.DestroyAPIView):
    serializer_class = ApplicationDocumentRequestsSerializer

    def get_queryset(self):
        return ApplicationRequestDocument.objects.filter(id=self.kwargs['pk'])


class ApplicationSubmitChangesAPIView(CompanyUserViewMixin, APIView):
    def post(self, request, *args, **kwargs):
        fund_external_id = request.data.get('fund_external_id')
        application = get_application_or_404({
            'fund__external_id': fund_external_id,
            'company_id__in': self.company_ids,
            'user_id': self.requested_user.id
        })
        ApplicationChangeRequests(application=application).resubmit_changes()
        return Response({'status': 'success'})


class ApplicationHasRequestedChangeAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        fund_external_id = kwargs.get('fund_external_id')
        application = get_application_or_404({
            'fund__external_id': fund_external_id,
            'company_id__in': self.company_ids,
            'user_id': self.requested_user.id
        })
        has_pending_requests = ApplicationChangeRequests(application=application).has_pending_change_requests()
        return Response({'has_pending_requests': has_pending_requests})


class ApplicationWorkflowStatusAPIView(CompanyUserViewMixin, APIView):

    def get_tax_status(self, application):
        if application.fund.skip_tax:
            return True
        parent_workflow = application.workflow
        tax_record = application.tax_record
        if not parent_workflow or not tax_record:
            return False

        is_approved = tax_record.is_approved

        tax_workflow = parent_workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.TAX_RECORD.value
        ).last()

        if is_approved:
            return is_approved
        elif tax_workflow:
            return tax_workflow.is_completed
        else:
            return False

    @staticmethod
    def is_pre_document_stage_approved(application):
        parent_workflow = application.workflow
        pre_document_workflow = parent_workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value
        ).last()

        return pre_document_workflow.is_completed if pre_document_workflow else None

    @staticmethod
    def has_pre_document_workflow(application):
        parent_workflow = application.workflow
        return  parent_workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value
        ).exists()

    @staticmethod
    def completed_kyc_review_stage(aml_kyc_workflow):
        if not aml_kyc_workflow:
            return False

        return aml_kyc_workflow.workflow_tasks.filter(
            completed=True,
            task_type=Task.TaskTypeChoice.USER_RESPONSE.value
        ).exists()


    @staticmethod
    def are_tax_documents_signed(application: Application):
        if not application.tax_record:
            return False

        return application.tax_record.ready_for_review()

    def get(self, request, *args, **kwargs):
        fund_external_id = kwargs.get('fund_external_id')
        application = get_application_or_404({
            'fund__external_id': fund_external_id,
            'company_id__in': self.company_ids,
            'user_id': self.requested_user.id
        })
        parent_workflow = application.workflow
        fund = application.fund  # type: Fund
        has_pre_document_stage = fund.has_pre_document_signing_approval()

        if not parent_workflow:
            can_go_past_eligibility = False
            if not fund.wait_for_approval:
                can_go_past_eligibility = True

            if has_pre_document_stage:
                can_go_past_eligibility = True

            return Response({
                'is_allocation_approved': False,
                'is_aml_kyc_approved': False,
                'is_tax_info_submitted': False,
                'are_tax_documents_signed': False,
                'is_payment_info_submitted': False,
                'is_application_approved': False,
                'is_approved': False,
                'is_locked': False,
                'can_go_past_eligibility': can_go_past_eligibility
            })

        aml_kyc_workflow = parent_workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.AML_KYC.value,
            sub_module=str(application.kyc_record.kyc_investor_type)
        ).last()

        is_payment_info_submitted = bool(application.payment_detail)

        if application.eligibility_response and application.eligibility_response.is_approved:
            is_allocation_approved = True
        else:
            is_allocation_approved = False

        is_aml_kyc_approved = aml_kyc_workflow and aml_kyc_workflow.is_completed
        # if not is_aml_kyc_approved:
        #     is_aml_kyc_approved = application.kyc_record.is_auto_approved()
        is_tax_approved = self.get_tax_status(application)
        is_application_approved = application.status == Application.Status.APPROVED.value
        are_tax_documents_signed = self.are_tax_documents_signed(application=application)
        is_approved = application.status in [Application.Status.APPROVED, Application.Status.FINALIZED]

        payload = {
            'is_allocation_approved': is_allocation_approved,
            'is_aml_kyc_approved': is_aml_kyc_approved,
            'is_tax_info_submitted': is_tax_approved,
            'are_tax_documents_signed': are_tax_documents_signed,
            'is_payment_info_submitted': is_payment_info_submitted,
            'is_application_approved': is_application_approved,
            'is_approved': is_approved,
            'is_locked': application.is_gp_signed(),
            'user_completed_kyc': self.completed_kyc_review_stage(aml_kyc_workflow=aml_kyc_workflow),
        }

        if not fund.wait_for_approval:
            can_go_past_eligibility = True
            can_view_agreements = True
        else:
            can_go_past_eligibility = is_approved
            can_view_agreements = is_approved and is_aml_kyc_approved and is_tax_approved and is_payment_info_submitted

            if has_pre_document_stage:
                has_pre_document_workflow = self.has_pre_document_workflow(application=application)
                can_go_past_eligibility = True
                pre_document_stage_approved = self.is_pre_document_stage_approved(application=application)
                payload['is_pre_document_stage_approved'] = pre_document_stage_approved
                payload['has_pre_document_stage'] = True
                payload['application_view_editing_disabled'] = not has_pre_document_workflow
                payload['has_pre_document_workflow'] = has_pre_document_workflow
                can_view_agreements = pre_document_stage_approved and is_aml_kyc_approved

        payload.update(
            {
                'can_go_past_eligibility': can_go_past_eligibility,
                'can_view_agreements': can_view_agreements,
            }
        )

        return Response(payload)


class UserApplicationStateListCreateAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = UserApplicationStateSerializer

    def get_queryset(self):
        return UserApplicationState.objects.filter(
            user=self.requested_user,
            fund__external_id=self.kwargs.get('fund_external_id'),
            fund__company_id__in=self.company_ids
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.requested_user
        context['fund'] = get_object_or_404(
            Fund,
            company_id__in=self.company_ids,
            external_id=self.kwargs['fund_external_id']
        )
        return context


class ApplicationModuleStatesAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        fund_external_id = kwargs.get('fund_external_id')
        application = get_application_or_404({
            'fund__external_id': fund_external_id,
            'company_id__in': self.company_ids,
            'user_id': self.requested_user.id
        })
        application_task_status = FundApplicationsStatusService(
            fund=application.fund,
            application=application
        ).process()
        status = application_task_status.get(application.id, {})
        return Response(status)


class ApplicationNextStateAPIView(CompanyUserViewMixin, APIView):

    def get(self, request, *args, **kwargs):
        fund_external_id = kwargs.get('fund_external_id')
        application = get_application_or_404({
            'fund__external_id': fund_external_id,
            'company_id__in': self.company_ids,
            'user_id': self.requested_user.id
        })
        status, next_url, changes_requested_module, application_completed = InvestorApplicationsStatusService(
            user=self.requested_user,
            application=application
        ).process()
        status = status.get(fund_external_id, None)
        next_url = next_url.get(fund_external_id, None)
        changes_requested_module = changes_requested_module.get(fund_external_id, None)
        application_completed = application_completed.get(fund_external_id, None)
        return Response(
            {
                'status': status,
                'next_url': next_url,
                'changes_requested_module': changes_requested_module,
                'application_completed': application_completed
            }
        )
