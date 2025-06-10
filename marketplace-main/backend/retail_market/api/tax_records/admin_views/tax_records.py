from api.applications.models import Application
from api.tax_records.admin_views.serializers import AdminTaxDocumentCreationSerializer
from api.tax_records.models import TaxRecord, TaxForm
from api.mixins.admin_view_mixin import AdminViewMixin
from rest_framework.generics import ListAPIView, RetrieveAPIView, UpdateAPIView, CreateAPIView
from api.tax_records.admin_views import serializers
from rest_framework import exceptions
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.documents.models import TaxDocument


class TaxRecordsListAPIView(AdminViewMixin, ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = serializers.TaxRecordSerializer

    def get_queryset(self):
        if self.admin_user:
            return TaxRecord.objects.filter(company=self.company).filter(deleted=False).prefetch_related(
                'tax_documents')
        else:
            raise exceptions.PermissionDenied


class TaxDocumentListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = serializers.TaxDocumentSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        try:
            tax_record = TaxRecord.objects.get(
                company=self.company,
                deleted=False,
                id=self.kwargs['record_id']
            )
        except TaxRecord.DoesNotExist:
            return []
        return TaxDocument.objects.filter(
            tax_record=tax_record,
            deleted=False,
            tax_record__deleted=False
        ).order_by("-completed").prefetch_related('document', 'form')


class AllTaxDocumentListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = serializers.TaxDocumentSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return TaxDocument.include_deleted.filter(
            tax_record_id=self.kwargs['record_id'],
            tax_record__company=self.company
        ).order_by("deleted").prefetch_related('document', 'form')


class TaxDocumentUpdateAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = serializers.BaseTaxDocumentSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return TaxDocument.include_deleted.filter(
            tax_record_id=self.kwargs['record_id'],
            tax_record__company=self.company
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        application = Application.objects.get(
            company=self.company,
            id=self.kwargs['application_id']
        )
        context['application'] = application
        return context


class CreateTaxDocumentAPIView(AdminViewMixin, CreateAPIView):
    queryset = TaxDocument.objects.all()
    serializer_class = AdminTaxDocumentCreationSerializer


class TaxFormsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = serializers.TaxFormSerializer
    permission_classes = (IsSidecarAdminUser,)

    def get_queryset(self):
        return TaxForm.objects.filter(
            company=self.company,
        )


class TaxRecordRetrieveAPIView(AdminViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = serializers.TaxRecordSerializer
    queryset = TaxRecord.objects.all()
