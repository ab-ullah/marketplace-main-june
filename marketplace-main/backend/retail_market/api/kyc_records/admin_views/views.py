from django.db.models import Q, Prefetch
from rest_framework.views import APIView

from api.applications.models import Application
from api.cards.models import Card
from api.constants.kyc_investor_types import KYCInvestorType
from api.documents.models import KYCDocument
from api.kyc_records.admin_views.serializers import KYCUpdateSerializer
from api.kyc_records.models import KYCRecord
from api.kyc_records.serializers import KYCDocumentSerializer, KYCParticipantSerializer, \
    KYCAdminSerializerWithDocuments, KYCAdminDocumentSerializer
from api.kyc_records.services.kyc_version_service import KYCVersionHistory
from api.mixins.admin_view_mixin import AdminViewMixin
from api.mixins.application_view_mixin import ApplicationViewMixin
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from rest_framework.generics import RetrieveAPIView, ListAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, \
    UpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from api.kyc_records.views import _get_serializer_by_investor_type, _get_serializer_by_workflow_slug, _delete_documents


class KYCRetrieveAPIView(AdminViewMixin, ApplicationViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)

    def retrieve(self, request, *args, **kwargs):
        uuid = self.kwargs['uuid']
        try:
            instance = KYCRecord.objects.filter(deleted=False).get(uuid=uuid)

        except KYCRecord.DoesNotExist:
            return Response(
                {'status': 'KYC Record not found {}'.format(self.kwargs['uuid'])},
                status=status.HTTP_404_NOT_FOUND)

        application = self.get_application
        if application and application.gp_signing_completed_at:
            instance = KYCVersionHistory(
                application=application,
                kyc_record=instance
            ).get_record()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_serializer_class(self):
        return _get_serializer_by_investor_type(self.kwargs['uuid'])


class KYCUpdateAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = KYCUpdateSerializer
    lookup_field = 'uuid'
    lookup_url_kwarg = 'uuid'

    def get_queryset(self):
        return KYCRecord.objects.filter(company=self.company)


class ApplicationKycInfoListAPIView(AdminViewMixin, ApplicationViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = KYCAdminSerializerWithDocuments

    def get_queryset(self):
        application = Application.objects.get(
            company=self.company,
            id=self.kwargs['application_id']
        )
        if not application.kyc_record:
            return KYCRecord.objects.none()

        kyc_record_id = application.kyc_record_id
        return KYCRecord.objects.filter(
            Q(id=kyc_record_id) | Q(kyc_entity__id=kyc_record_id)
        ).prefetch_related(
            Prefetch(
                'kyc_documents',
                queryset=KYCDocument.include_deleted.order_by('kyc_record_file_id', 'deleted', 'document__title')
            )
        ).order_by('-kyc_investor_type')


class KYCListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        wf_slug = self.kwargs['wf_slug']
        return KYCRecord.objects.filter(workflow__slug=wf_slug, deleted=False)

    def get_serializer_class(self):
        return _get_serializer_by_workflow_slug(str(self.kwargs['wf_slug']))


class KYCDocumentListAPIView(AdminViewMixin, ListCreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = KYCDocumentSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['uploaded_by_admin'] = True
        return context

    def get_queryset(self):
        return KYCDocument.objects.filter(
            kyc_record_id=int(self.kwargs['kyc_record_id']),
            deleted=False,
            kyc_record__deleted=False
        )


class KYCDocumentUpdateAPIView(AdminViewMixin, UpdateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = KYCAdminDocumentSerializer

    def get_queryset(self):
        return KYCDocument.include_deleted.filter(
            kyc_record_id=int(self.kwargs['kyc_record_id'])
        )


class KYCParticipantAPIView(AdminViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)
    queryset = KYCRecord.objects.filter(kyc_investor_type=KYCInvestorType.PARTICIPANT, deleted=False)
    serializer_class = KYCParticipantSerializer


class KYCRetrieveUpdateDestroyAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save()
        self.delete_documents(KYCDocument.objects.filter(kyc_record=instance).all())
        for participant in instance.kyc_participants.all():
            self.delete_documents(KYCDocument.objects.filter(kyc_record=participant).all())
            participant.deleted = True
            participant.save()

    @staticmethod
    def delete_documents(docs):
        for doc in docs:
            doc.deleted = True
            doc.save()

    def get_queryset(self):
        return KYCRecord.objects.filter(deleted=False, company=self.company).all()

    def get_serializer_class(self):
        return _get_serializer_by_workflow_slug(str(self.kwargs['wf_slug']))


class DocumentFieldOptions(AdminViewMixin, APIView):
    def get(self, request, *args, **kwargs):
        cards = Card.objects.filter(
            workflow__company=self.company
        )
        mapping = {}
        options = []
        for card in cards:
            if not card.schema:
                continue
            for field in card.schema:
                if not field.get('type') == 'file_upload':
                    continue
                field_id = field.get('id')
                if field_id in mapping:
                    continue
                mapping[field_id] = field['label']
                options.append({'label': field['label'], 'value': field_id})
        return Response({'options': options, 'mapping': mapping})
