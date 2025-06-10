from typing import List, Type

from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, GenericAPIView, CreateAPIView, \
    RetrieveAPIView, get_object_or_404, UpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from slugify import slugify

from api.cards.default.workflow_types import WorkflowTypes
from api.comments.models import ApplicationComment
from api.documents.models import KYCDocument
from api.funds.models import Fund
from api.geographics.models import Country
from api.kyc_records.models import KYCRecord, KYCInvestorType, KYCRiskEvaluation
from api.kyc_records.serializers import KYCIndividualSerializer, KYCDocumentSerializer, KYCSchemaSerializer, \
    KYCTrustSerializer, KYCPrivateCompanySerializer, KYCParticipantSerializer, KYCLimitedPartnershipSerializer, \
    KYCSerializer, \
    KYCRiskEvaluationSerializer, KYCInvestorTypeUpdateSerializer
from api.kyc_records.services.aml_kyc_review import AmlKycReviewService
from api.kyc_records.services.kyc_version_service import KYCVersionHistory
from api.kyc_records.utils import reset_kyc_record_approval
from api.mixins.admin_view_mixin import AdminViewMixin
from api.mixins.application_view_mixin import ApplicationViewMixin
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class KYCCreateAPIView(CompanyUserViewMixin, ApplicationViewMixin, ListCreateAPIView):

    def get_queryset(self):
        wf_slug = self.kwargs['wf_slug']
        qs = KYCRecord.objects.filter(workflow__slug=wf_slug)
        record_id = self.request.GET.get('id')
        if record_id:
            qs = qs.filter(id=int(record_id))
            application = self.get_application
            if application:
                kyc_record = get_object_or_404(
                    KYCRecord,
                    user=application.user,
                    id=record_id
                )
                return KYCVersionHistory(
                    application=application,
                    kyc_record=kyc_record
                ).get_queryset({'id': record_id, 'workflow__slug': wf_slug})

        return qs

    def get_serializer_class(self):
        return _get_serializer_by_workflow_slug(str(self.kwargs['wf_slug']))


class KYCDocumentDeleteAPIView(CompanyUserViewMixin, GenericAPIView):

    def delete(self, request, kyc_record_id, document_id):
        try:
            instance = KYCDocument.objects.filter(document__document_id=document_id, deleted=False,
                                                  kyc_record_id=kyc_record_id).get()
        except KYCDocument.DoesNotExist:
            # Not found
            return Response({'status': 'Document with id {} not found.'.format(document_id)},
                            status=status.HTTP_404_NOT_FOUND)
        instance.deleted = True
        instance.save()

        fund_external_id = self.request.GET.get('fundExternalId')
        if fund_external_id:
            reset_kyc_record_approval(
                kyc_record=instance.kyc_record,
                fund_external_id=fund_external_id,
                user=self.requested_user
            )

        ApplicationComment.objects.filter(
            document_identifier=instance.document.document_id,
            status=ApplicationComment.Statuses.CREATED
        ).update(status=ApplicationComment.Statuses.UPDATED)

        return Response({'status': 'Document with id {} deleted.'.format(document_id)},
                        status=status.HTTP_202_ACCEPTED)


class KYCRetrieveMineAPIView(CompanyUserViewMixin, RetrieveAPIView):

    def retrieve(self, request, *args, **kwargs):
        wf_slug = self.kwargs['wf_slug']
        try:
            instance = KYCRecord.objects.exclude(kyc_investor_type=KYCInvestorType.PARTICIPANT).get(
                workflow__slug=wf_slug,
                user=self.requested_user,
                deleted=False
            )
        except KYCRecord.DoesNotExist:
            return Response(
                {'status': 'KYC Record for the workflow with slug {} not found.'.format(self.kwargs['wf_slug'])},
                status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_serializer_class(self):
        return _get_serializer_by_workflow_slug(str(self.kwargs['wf_slug']))


class KYCRetrieveAPIView(CompanyUserViewMixin, ApplicationViewMixin, RetrieveAPIView):

    def get_object(self):
        uuid = self.kwargs['uuid']
        kyc_record = get_object_or_404(
            KYCRecord,
            user=self.requested_user,
            company_id__in=self.company_ids,
            deleted=False,
            uuid=uuid
        )
        application = self.get_application
        if not application or not application.gp_signing_completed_at:
            return kyc_record

        return KYCVersionHistory(
            application=application,
            kyc_record=kyc_record
        ).get_record()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['application'] = self.get_application
        return context

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_serializer_class(self):
        return _get_serializer_by_investor_type(self.kwargs['uuid'])


class UpdateKYCRecordWorkflow(CompanyUserViewMixin, UpdateAPIView):
    serializer_class = KYCInvestorTypeUpdateSerializer

    lookup_field = 'uuid'
    lookup_url_kwarg = 'uuid'

    def get_queryset(self):
        return KYCRecord.objects.filter(
            company_id__in=self.company_ids,
            user=self.requested_user
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['fund'] = get_object_or_404(
            Fund,
            external_id=self.kwargs['fund_external_id'],
            company_id__in=self.company_ids
        )
        return context


class KYCRetrieveUpdateDestroyAPIView(CompanyUserViewMixin, RetrieveUpdateDestroyAPIView):

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save()
        _delete_documents(KYCDocument.objects.filter(kyc_record=instance).all())
        for participant in instance.kyc_participants.all():
            _delete_documents(KYCDocument.objects.filter(kyc_record=participant).all())
            participant.deleted = True
            participant.save()

    def get_queryset(self):
        return KYCRecord.objects.filter(deleted=False).all()

    def get_serializer_class(self):
        return _get_serializer_by_workflow_slug(str(self.kwargs['wf_slug']))


class KYCDocumentCreateListAPIView(CompanyUserViewMixin,ApplicationViewMixin, ListCreateAPIView):
    serializer_class = KYCDocumentSerializer

    def get_queryset(self):
        kyc_record_id = int(self.kwargs['kyc_record_id'])
        # TODO: This API is used on both Investor and admin side, we should create separate views for these on admin side
        kyc_record = get_object_or_404(
            KYCRecord,
            id=kyc_record_id
        )
        application = self.get_application
        if not application:
            return KYCDocument.objects.filter(
                kyc_record_id=kyc_record_id,
                deleted=False,
                kyc_record__deleted=False
            ).select_related('document')
        else:
            return KYCVersionHistory(
                application=application,
                kyc_record=kyc_record
            ).get_documents()


def build_country_field(model_field):
    field = {
        'id': model_field.name,
        'label': model_field.name.title().replace('_', ' '),
        'type': "select-country",
        'required': False, 'data': []
    }
    for country in Country.objects.all():
        field['data'].append((country.id, country.name))
    return field


class KYCSchemaListAPIView(ListCreateAPIView):
    serializer_class = KYCSchemaSerializer

    def get_queryset(self):
        fields = []
        for model_field in KYCRecord._meta.fields:
            if 'country' in model_field.name:
                fields.append(build_country_field(model_field))
                continue
            if model_field.name not in ('id', 'created_at', 'modified_at', 'user', 'workflow', 'company'):
                fields.append(self.build_standard_field(model_field))
        return fields

    def build_standard_field(self, model_field):
        field = {
            'id': model_field.name,
            'label': model_field.name.title().replace('_', ' '),
            'type': "text",
            'required': False
        }
        if model_field.choices:
            field['type'] = 'custom-select'
            field['data'] = model_field.choices
        return field


class KYCParticipantAPIView(CompanyUserViewMixin, CreateAPIView, RetrieveUpdateDestroyAPIView):
    queryset = KYCRecord.objects.filter(kyc_investor_type=KYCInvestorType.PARTICIPANT, deleted=False)
    serializer_class = KYCParticipantSerializer

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save()
        _delete_documents(KYCDocument.objects.filter(kyc_record=instance).all())


class KYCRiskEvaluationCreateAPIView(AdminViewMixin, CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    queryset = KYCRiskEvaluation.objects.all()
    serializer_class = KYCRiskEvaluationSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['kyc_id'] = self.kwargs['kyc_record_id']
        return context


class KYCReviewAPIView(CompanyUserViewMixin, APIView):
    def get(self, request, fund_external_id, kyc_record_id):
        fund = get_object_or_404(
            Fund,
            external_id=fund_external_id,
            company_id__in=self.company_ids
        )
        kyc_record = get_object_or_404(
            KYCRecord,
            pk=kyc_record_id,
            company_id__in=self.company_ids,
            user=self.requested_user
        )
        AmlKycReviewService(
            kyc_record=kyc_record,
            fund=fund,
            user=self.requested_user
        ).start_review(force_mark_completed=kyc_record.is_auto_approved())
        return Response({'status': 'success'})


def _delete_documents(docs: List[KYCDocument]):
    for doc in docs:
        doc.deleted = True
        doc.save()


def _get_serializer_by_workflow_slug(slug: str) -> Type[KYCSerializer]:
    if slug.startswith(slugify(WorkflowTypes.INDIVIDUAL.value)):
        return KYCIndividualSerializer
    elif slug.startswith(slugify(WorkflowTypes.PRIVATE_COMPANY.value)):
        return KYCPrivateCompanySerializer
    elif slug.startswith(slugify(WorkflowTypes.LIMITED_PARTNERSHIP.value)):
        return KYCLimitedPartnershipSerializer
    elif slug.startswith(slugify(WorkflowTypes.TRUST.value)):
        return KYCTrustSerializer


def _get_serializer_by_investor_type(uuid: str) -> Type[KYCSerializer]:
    kyc_record = KYCRecord.objects.get(uuid=uuid)
    if kyc_record.kyc_investor_type == KYCInvestorType.INDIVIDUAL.value:
        return KYCIndividualSerializer
    elif kyc_record.kyc_investor_type == KYCInvestorType.PRIVATE_COMPANY.value:
        return KYCPrivateCompanySerializer
    elif kyc_record.kyc_investor_type == KYCInvestorType.LIMITED_PARTNERSHIP.value:
        return KYCLimitedPartnershipSerializer
    elif kyc_record.kyc_investor_type == KYCInvestorType.TRUST.value:
        return KYCTrustSerializer
