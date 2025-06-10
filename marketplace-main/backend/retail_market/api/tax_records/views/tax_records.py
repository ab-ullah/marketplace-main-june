from rest_framework import status
from rest_framework.generics import CreateAPIView, ListCreateAPIView, RetrieveAPIView, UpdateAPIView, ListAPIView, \
    GenericAPIView, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response

from api.applications.utils import get_application_or_404
from api.companies.models import CompanyUser
from api.documents.models import TaxDocument
from api.kyc_records.services.check_and_start_kyc_review import CheckAndStartKYCReview
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.tax_records import serializers
from api.tax_records.models import TaxRecord
from api.tax_records.services.tax_review import TaxReviewService
from api.workflows.services.approval_service import WorkFlowApprovalService
from api.workflows.services.user_on_boarding_workflow import UserOnBoardingWorkFlowService


class TaxRecordCreateAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = serializers.TaxRecordSerializer

    def get_serializer_context(self):
        application = get_application_or_404({
            'user_id': self.requested_user.id,
            'fund__external_id': self.kwargs['fund_external_id'],
            'company_id__in': self.company_ids,
        })
        context = super(TaxRecordCreateAPIView, self).get_serializer_context()
        context.update({"fund_external_id": self.kwargs['fund_external_id'], 'application': application})
        return context

    def get_queryset(self):
        return TaxRecord.objects.filter(
            user=self.requested_user,
            company_id__in=self.company_ids,
            deleted=False
        )


class TaxDocumentCreateAPIView(CompanyUserViewMixin, CreateAPIView):
    serializer_class = serializers.TaxDocumentSerializer

    def get_serializer_context(self):
        tax_record_id = self.kwargs['tax_record_id']
        context = super(TaxDocumentCreateAPIView, self).get_serializer_context()
        context.update({"tax_record_id": tax_record_id})
        return context


class TaxDocumentDeleteAPIView(CompanyUserViewMixin, GenericAPIView):
    def delete(self, request, tax_record_id, document_id):
        try:
            instance = TaxDocument.objects.filter(document__document_id=document_id, deleted=False,
                                                  tax_record_id=tax_record_id).get()
        except TaxDocument.DoesNotExist:
            # Not found
            return Response({'status': 'Document with id {} not found.'.format(document_id)},
                            status=status.HTTP_404_NOT_FOUND)
        if instance.owner.id != self.requested_user.id:
            return Response({'status': 'Document with id {} NOT deleted.'.format(document_id)},
                            status=status.HTTP_401_UNAUTHORIZED)
        instance.deleted = True
        instance.save()
        return Response({'status': 'Document with id {} deleted.'.format(document_id)},
                        status=status.HTTP_202_ACCEPTED)


class SaveFormAPIView(CompanyUserViewMixin, UpdateAPIView):
    serializer_class = serializers.SaveFormSerializer
    lookup_field = 'envelope_id'

    def get_queryset(self):
        return TaxDocument.objects.filter(owner=self.requested_user).filter(deleted=False)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        application = get_application_or_404({
            'user_id': self.requested_user.id,
            'fund__external_id': self.kwargs['fund_external_id'],
            'company_id__in': self.company_ids,
        })
        context['application'] = application
        return context


class TaxDocumentListAPIView(CompanyUserViewMixin, ListAPIView):
    serializer_class = serializers.TaxDocumentSerializer

    def get_queryset(self):
        try:
            tax_record = TaxRecord.objects.filter(
                user=self.requested_user,
                company_id__in=self.company_ids,
                uuid=self.kwargs['tax_record_id'],
                deleted=False
            ).latest('created_at')
        except TaxRecord.DoesNotExist:
            return []
        return TaxDocument.objects.filter(tax_record=tax_record, deleted=False, tax_record__deleted=False).order_by(
            "-completed").prefetch_related(
            'document', 'form'
        )


class UpdateTaxRecordView(CompanyUserViewMixin, UpdateAPIView):
    serializer_class = serializers.TaxRecordSerializer
    queryset = TaxRecord.objects.all()
    lookup_field = 'uuid'
    lookup_url_kwarg = 'uuid'


class TaxRecordListAPIView(CompanyUserViewMixin, RetrieveAPIView):
    serializer_class = serializers.TaxRecordSerializer
    queryset = TaxRecord.objects.all()
    lookup_field = 'uuid'
    lookup_url_kwarg = 'uuid'


class CreateTaxWorkflow(CompanyUserViewMixin, APIView):

    def get_company_user(self, application):
        return get_object_or_404(
            CompanyUser,
            company=application.company,
            user=application.user
        )

    def post(self, request, *args, **kwargs):
        application = get_application_or_404({
            'user_id': self.requested_user.id,
            'fund__external_id': self.kwargs['fund_external_id'],
            'company_id__in': self.company_ids,
        })

        fund = application.fund
        on_boarding_workflow_service = UserOnBoardingWorkFlowService(
            fund=fund,
            company_user=self.get_company_user(application),
            transferred_application_id=application.id if application.is_transferred else None
        )
        on_boarding_workflow_service.get_or_create_tax_workflow()
        CheckAndStartKYCReview.async_check_and_start_review(
            fund_external_id=application.fund.external_id,
            kyc_record=application.kyc_record
        )

        return Response({'status': 'success'}, status=status.HTTP_202_ACCEPTED)


class CreateTaxReviewTask(CompanyUserViewMixin, APIView):

    def get_company_user(self, application):
        return get_object_or_404(
            CompanyUser,
            company=application.company,
            user=application.user
        )

    def post(self, request, *args, **kwargs):
        application = get_application_or_404({
            'user_id': self.requested_user.id,
            'fund__external_id': self.kwargs['fund_external_id'],
            'company_id__in': self.company_ids,
        })

        tax_record = get_object_or_404(
            TaxRecord,
            uuid=self.kwargs['uuid']
        )

        CheckAndStartKYCReview.async_check_and_start_review(
            fund_external_id=application.fund.external_id,
            kyc_record=application.kyc_record
        )

        tax_documents_count = TaxDocument.objects.filter(tax_record=tax_record, deleted=False).count()
        completed_documents_count = TaxDocument.objects.filter(
            tax_record=tax_record,
            completed=True,
            deleted=False
        ).count()

        if tax_documents_count == completed_documents_count and not tax_record.is_approved:
            TaxReviewService(tax_record=tax_record,
                             fund=application.fund,
                             user=self.get_company_user(application).user).start_review()

        aml_kyc_approved = WorkFlowApprovalService.aml_kyc_approved(parent_workflow=application.workflow)
        tax_approved = tax_documents_count == completed_documents_count and tax_record.is_approved
        if aml_kyc_approved and tax_approved and not application.aml_kyc_tax_email_sent:
            WorkFlowApprovalService.send_aml_kyc_tax_approved(application_id=application.id)

        return Response({'status': 'success'}, status=status.HTTP_202_ACCEPTED)
