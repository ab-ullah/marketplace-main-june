import csv
import http
import uuid
from io import StringIO

from django.db import transaction, IntegrityError
from django.db.models import Q
from django.http import HttpResponseBadRequest
from django.utils import timezone
from django_q.tasks import async_task
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from api.admin_users.models import AdminUser
from api.applications.admin_views import serializers
from api.applications.admin_views.serializers import ApplicantManagementSerializer, \
    ApplicationDocumentRequestsSerializer, ApplicantListViewSerializer, ApplicantAmlKycSerializer, \
    ApplicationRetrieveSerializer
from api.applications.constants import APPLICATION_APPROVAL_STATUSES
from api.applications.models import Application, ApplicationDocumentsRequests
from api.applications.serializers import ApplicationRequestDocumentSerializer
from api.applications.services.reset_application import ApplicationResetService
from api.applications.services.send_allocation_approval_emails import SendAllocationApprovalEmailService
from api.applications.services.send_application_updated_email import SendApplicationUpdateEmail
from api.applications.services.send_application_withdrawn_email import SendApplicationWithdrawnEmail
from api.applications.tasks import reset_applications_for_kyc_record
from api.documents.models import ApplicationRequestDocument, Document, InvestorAccountCodeBulkUpdateDocument
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.funds.models import Fund
from api.geographics.selectors.country_selectors import get_country_id_name_map
from api.investors.models import Investor
from api.libs.utils.user_name import get_display_name
from api.mixins.admin_view_mixin import AdminViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.workflows.models import Task
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService


class ApplicationListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = serializers.ApplicationSerializer

    def get_queryset(self):
        return Application.active_applications.filter(
            company=self.company,
            fund__external_id=self.kwargs['fund_external_id']
        ).prefetch_related('tax_record')


class ApplicationRetrieveView(AdminViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ApplicationRetrieveSerializer
    queryset = Application.active_applications.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        admin_users = AdminUser.objects.filter(company=self.company).select_related('user')
        admin_name_mapping = {str(admin_user.id): get_display_name(admin_user.user) for admin_user in admin_users}
        context['admin_name_mapping'] = admin_name_mapping
        return context


class ApplicantManagementListView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ApplicantListViewSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['country_id_name_map'] = get_country_id_name_map()
        return context

    def get_queryset(self):
        return Application.active_applications.filter(
            company=self.company,
            fund__external_id=self.kwargs['fund_external_id']
        ).select_related(
            'eligibility_response__investment_amount',
            'investment_amount',
            'investor',
            'company',
            'share_class',
            'vehicle',
            'user',
            'kyc_record',
            'fund'
        )


class ExportApplicationsView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ApplicantManagementSerializer

    def get_queryset(self):
        return Application.active_applications.filter(
            company=self.company,
            fund__external_id=self.kwargs['fund_external_id']
        ).select_related(
            'eligibility_response__investment_amount',
            'investment_amount',
            'investor',
            'company',
            'share_class',
            'vehicle',
            'user',
            'kyc_record',
            'payment_detail'
        ).prefetch_related(
            'workflow__workflow_comments__created_by',
            'workflow__workflow_comments__created_by'
        )


class ExportApplicationAmlKycData(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ApplicantAmlKycSerializer

    def get_queryset(self):
        return Application.objects.filter(
            company=self.company,
            fund__external_id=self.kwargs['fund_external_id'],
            eligibility_response__is_eligible=True
        ).select_related(
            'company',
            'kyc_record',
        ).prefetch_related(
            'workflow__workflow_comments__created_by',
        ).exclude(
            status=Application.Status.WITHDRAWN,
            eligibility_response__isnull=True
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        admin_users = AdminUser.objects.filter(company=self.company).select_related('user')
        admin_name_mapping = {str(admin_user.id): get_display_name(admin_user.user) for admin_user in admin_users}
        context['admin_name_mapping'] = admin_name_mapping
        return context


class BulkUpdateApplicationStatus(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def update_task_status(self, application_id):
        fund = Application.objects.get(id=application_id).fund
        applications_count = Application.active_applications.filter(company=self.company, fund=fund).count()
        completed_applications_count = Application.active_applications.filter(
            company=self.company,
            fund=fund,
            status__in=APPLICATION_APPROVAL_STATUSES
        ).count()
        if completed_applications_count and applications_count == completed_applications_count:
            on_boarding_service = UserOnBoardingWorkFlowService(fund=fund, company_user=None)
            workflow = on_boarding_service.get_or_create_allocation_workflow()
            if workflow:
                workflow.workflow_tasks.update(
                    completed=True,
                    approver=self.admin_user,
                    approval_date=timezone.now(),
                    status=Task.StatusChoice.APPROVED.value
                )
                workflow.is_completed = True
                workflow.save(update_fields=['is_completed'])

    def post(self, request):
        data = request.data
        status = data.get('status')
        withdrawn_comment = data.get('withdrawn_comment')
        updated_fields = {'status': status, 'status_updated_by': request.user}
        ids_to_update = data.get('ids')
        if not ids_to_update:
            return HttpResponseBadRequest('[ids] is a required field')

        if withdrawn_comment:
            updated_fields['withdrawn_comment'] = withdrawn_comment

        for application in Application.active_applications.filter(
                company=self.company,
                id__in=ids_to_update
        ):
            for field, value in updated_fields.items():
                setattr(application, field, value)
                application.save()

        SendAllocationApprovalEmailService.send_emails(application_ids=ids_to_update)
        self.update_task_status(ids_to_update[0])

        # Only send emails after tasks and applications have been updated successfully.

        if int(status) == Application.Status.WITHDRAWN.value:
            SendApplicationWithdrawnEmail(ids_to_update).send_emails()

        return Response({'status': 'success'})


class ApplicationDocumentRequestCreateView(AdminViewMixin, CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ApplicationDocumentRequestsSerializer


class ApplicationDocumentsRequestsListView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ApplicationDocumentRequestsSerializer

    def get_queryset(self):
        return ApplicationDocumentsRequests.objects.filter(
            application_id=self.kwargs['application_id']
        ).prefetch_related('application')


class ApplicationDocumentRequestResponseListView(AdminViewMixin, ListAPIView):
    serializer_class = ApplicationRequestDocumentSerializer

    def get_queryset(self):
        application_document_requests = ApplicationDocumentsRequests.objects.filter(
            application_id=self.kwargs['application_id'])
        return ApplicationRequestDocument.objects.filter(application_document_request__in=application_document_requests)


class ApplicationUpdateVehicleAndShareClass(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def post(self, request):
        data = request.data
        share_class = data.get('share_class')
        vehicle = data.get('vehicle')
        comment = data.get('comment')
        max_leverage_ratio = data.get('max_leverage')
        application_id = data.get('application_id')
        has_comment = bool(comment and comment.strip())
        restricted_geographic_area = data.get('restricted_geographic_area')
        restricted_time_period = data.get('restricted_time_period')
        department = data.get('department')
        job_band = data.get('job_band')

        application = Application.active_applications.filter(
            company=self.company,
            id=application_id
        ).first()
        if application:
            fund_file_defaults = application.defaults_from_fund_file
            if department and fund_file_defaults:
                fund_file_defaults['department'] = department
            if job_band and fund_file_defaults:
                fund_file_defaults['job_band'] = job_band
            application.share_class_id = share_class
            application.vehicle_id = vehicle
            application.update_comment = comment
            application.max_leverage_ratio = max_leverage_ratio
            application.is_application_updated = has_comment
            application.restricted_geographic_area = restricted_geographic_area
            application.restricted_time_period = restricted_time_period
            if fund_file_defaults:
                application.defaults_from_fund_file = fund_file_defaults
            application.save()
            if has_comment:
                SendApplicationUpdateEmail(application_id).send_application_email()
            return Response({'status': 'success'})
        else:
            return Response({'status': 'not found'})


class ApplicationInvestorAccountCodeView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def post(self, request, application_id):
        application = get_object_or_404(
            Application,
            id=application_id,
            company=self.company
        )
        data = request.data
        investor_account_code = data['investor_account_code']
        if not investor_account_code:
            return Response({'error': 'No investor account code found'})
        try:
            investor = Investor.objects.get(investor_account_code=investor_account_code)
            if Application.active_applications.filter(
                    investor_id=investor.id,
                    fund_id=application.fund_id
            ).exclude(id=application_id).exists():
                return Response(
                    {
                        'investor_account_code': 'Investor account code can only be associated with one application for a fund'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Investor.DoesNotExist:
            investor = Investor.objects.create(
                investor_account_code=investor_account_code,
                name=get_display_name(user=application.user)
            )
        application.investor = investor
        application.save(update_fields=['investor'])
        return Response({'status': 'success'})


class RemoveApplicationsAPIView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def post(self, request, fund_external_id):
        data = request.data
        ids_to_update = data.get('ids')
        if not ids_to_update:
            return HttpResponseBadRequest('[ids] is a required field')

        Application.active_applications.filter(
            fund__external_id=fund_external_id,
            company=self.company,
            id__in=ids_to_update
        ).filter(
            Q(eligibility_response__isnull=True) | Q(eligibility_response__is_eligible=False)
        ).update(deleted=True)
        return Response({'status': 'success'})


class ApplicationResetAPIView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def post(self, request, *args, **kwargs):
        application_ids = request.data.get('ids', [])
        applications = Application.objects.filter(id__in=application_ids, company=self.company)
        kyc_ids = set()
        for application in applications:
            kyc_ids.add(application.kyc_record_id)
            ApplicationResetService(application=application, user=request.user).reset()

        # async_task(reset_applications_for_kyc_record, list(kyc_ids), request.user)

        return Response({'status': 'success'})


class ApplicationInvestorAccountCodesBulkUpdate(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser, )

    def upload_file(self, in_memory_file, fund):
        in_memory_file.file.seek(0)
        content_type = in_memory_file.content_type
        uploaded_document_info: UploadedDocumentInfo = UploadDocumentService.upload(
            document_data=in_memory_file,
            content_type=in_memory_file.content_type
        )

        document, document_created = Document.objects.update_or_create(
            partner_id=uuid.uuid4().hex,
            company=self.company,
            defaults={
                'content_type': content_type,
                'title': in_memory_file.name,
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': Document.DocumentType.BULK_UPDATE_INVESTOR_ACCOUNT_CODE.value,
                'file_date': timezone.now().date(),
                'access_scope': Document.AccessScopeOptions.INVESTOR_ONLY,
                'uploaded_by_admin': self.admin_user
            }
        )

        InvestorAccountCodeBulkUpdateDocument.objects.get_or_create(
            document=document,
            fund=fund
        )

    def buffer_file(self, in_memory_file):
        return StringIO(in_memory_file.file.read().decode('utf-8'))

    def read_file_rows(self, in_memory_file):
        reader = csv.DictReader(self.buffer_file(in_memory_file))
        yield from reader

    def patch(self, request, fund_external_id, *args, **kwargs):
        csvfile = request.data['bulk_update_file']
        # TODO: if csv is too big, n+1 query problem here will hurt UX
        fund = get_object_or_404(Fund.objects.filter(company=self.company), external_id=fund_external_id)
        investor_account_codes = {row['Application UUID']: row['Investor Account Code'] for row in self.read_file_rows(csvfile)}
        self.upload_file(csvfile, fund)
        uuids = list(investor_account_codes.keys())
        applications = Application.objects.filter(company=self.company, uuid__in=uuids).select_related('user', 'investor')
        errors = []
        successes_count = 0
        for application in applications.all():
            investor_account_code = investor_account_codes[str(application.uuid)]
            try:
                investor = Investor.objects.get(investor_account_code=investor_account_code)
                if Application.active_applications.filter(
                        investor_id=investor.id,
                        fund_id=application.fund_id
                ).exclude(id=application.id).exists():
                    errors.append({"message": f'Investor account code {investor_account_code} can only be associated with one application for a fund'})
            except Investor.DoesNotExist:
                investor = Investor.objects.create(
                    investor_account_code=investor_account_code,
                    name=get_display_name(user=application.user)
                )
            application.investor = investor
            application.save()
            successes_count += 1
        return Response({'successes': successes_count, 'errors': errors}, status=http.HTTPStatus.OK)
