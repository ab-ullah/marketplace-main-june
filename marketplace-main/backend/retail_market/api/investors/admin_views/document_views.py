from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from django_filters import rest_framework as filters
from rest_framework.filters import OrderingFilter
from django.db.models import Count, Max
from django.db.models import Q

from api.funds.models import Fund
from api.investors.admin_views.filters import DocumentsFilter, InvestorDocumentOrderingFilter
from api.libs.pagination.api_pagination import CustomPagination
from api.mixins.admin_view_mixin import AdminViewMixin
from api.investors.serializers import InvestorDocumentSerializer, CompanyFundDocumentCreateSerializer
from api.documents.models import FundDocument, InvestorDocument, Document
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.partners.mappings.lasalle import DOCUMENT_TYPE_MAPPING
from api.documents.serializers import FundInvestorDocumentsSerializer
from api.notifications.models import UserNotification
from api.partners.services.create_notification import DOCUMENT_TYPE_MAPPING as NOTIFICATIONS_TYPE_MAPPING


class CreateFundDocumentAPIView(AdminViewMixin, CreateAPIView):
    serializer_class = CompanyFundDocumentCreateSerializer


class CreateInvestorDocumentAPIView(AdminViewMixin, CreateAPIView):
    serializer_class = InvestorDocumentSerializer


class UpdateInvestorDocumentAPIView(AdminViewMixin, APIView):

    def post(self, request, *args, **kwargs):
        file_data = request.data.get("file_data")
        file_content_type = request.data.get("file_content_type")
        uploaded_document_info = None
        if file_data:
            uploaded_document_info = UploadDocumentService.upload(
                document_data=file_data,
                content_type=file_content_type
            )  # type: UploadedDocumentInfo

        document = Document.objects.get(document_id=self.kwargs['document_id'])
        UserNotification.objects.filter(documents=document).update(
            notification_type=NOTIFICATIONS_TYPE_MAPPING.get(DOCUMENT_TYPE_MAPPING[request.data.get('document_type')]),
            due_date=request.data.get('due_date')
        )

        document.document_type = DOCUMENT_TYPE_MAPPING[request.data.get('document_type')]
        document.file_date = request.data.get('file_date')
        document.title = request.data.get('title')

        if uploaded_document_info:
            document.extension = uploaded_document_info.extension
            document.document_id = uploaded_document_info.document_id
            document.document_path = uploaded_document_info.document_path
            document.content_type = file_content_type

        document.save()
        return Response({"status": "Success"})


class DestroyFundInvestorDocumentAPIView(AdminViewMixin, APIView):

    def delete(self, request, *args, **kwargs):
        document_type = self.kwargs['document_type']
        record_id = self.kwargs['pk']
        if document_type == 'fund-document':
            document = Document.objects.get(id=record_id)
            FundDocument.objects.filter(document=document).update(deleted=True)
            UserNotification.objects.filter(documents=document).update(deleted=True)
            document.deleted = True
            document.save()
        else:
            document = Document.objects.get(id=record_id)
            InvestorDocument.objects.filter(document=document).update(deleted=True)
            UserNotification.objects.filter(documents=document).update(deleted=True)
            document.deleted = True
            document.save()

        return Response({"status": "Success"})


class InvestorDocumentsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = FundInvestorDocumentsSerializer
    pagination_class = CustomPagination
    filter_backends = (filters.DjangoFilterBackend, InvestorDocumentOrderingFilter)
    filterset_class = DocumentsFilter
    ordering = ['-created_at']

    def get_queryset(self):
        return Document.objects.filter(company=self.company, deleted=False).annotate(
            fund_documents_count=Count('document_fund')).annotate(
            investor_documents_count=Count('document_investors')) \
            .annotate(max_due_date=Max('document_notifications__notification__due_date')) \
            .filter(Q(fund_documents_count__gte=1) |
                    Q(investor_documents_count__gte=1)) \
            .exclude(document_fund__require_acknowledgement=True)


class InvestorDocumentFiltersAPIView(AdminViewMixin, APIView):

    def get(self, request):
        investor_documents = InvestorDocument.objects.filter(
            document__company=self.company
        )
        fund_documents = FundDocument.objects.filter(
            document__company=self.company,
        ).exclude(require_acknowledgement=True)
        queryset = Document.objects.filter(company=self.company, deleted=False).annotate(
            fund_documents_count=Count('document_fund')).annotate(
            investor_documents_count=Count('document_investors')) \
            .filter(Q(fund_documents_count__gte=1) |
                    Q(investor_documents_count__gte=1)) \
            .exclude(document_fund__require_acknowledgement=True)

        document_types = queryset.values_list('document_type', flat=True).order_by('document_type').distinct()
        document_names = queryset.values_list('title', flat=True).order_by('title').distinct()

        investors = investor_documents.values(
            'investor__id', 'investor__name'
        ).order_by('investor__id').distinct('investor__id')
        investors = [
            {'label': investor['investor__name'], 'value': investor['investor__id']} for
            investor in investors
        ]

        investor_funds = investor_documents.values_list('fund_id', flat=True).order_by('fund_id').distinct()
        fund_document_funds = fund_documents.values_list('fund_id', flat=True).order_by('fund_id').distinct()

        fund_ids = set(investor_funds).union(set(fund_document_funds))
        fund_options = Fund.objects.filter(id__in=fund_ids).values('id', 'name')

        fund_options = [
            {'label': fund_option['name'], 'value': fund_option['id']} for
            fund_option in fund_options
        ]

        document_types = [
            {'label': Document.DocumentType(document_type).label, 'value': document_type} for
            document_type in document_types
        ]

        document_names = [
            {'label': document_name, 'value': document_name} for
            document_name in document_names
        ]

        return Response(
            {
                "document_types": document_types,
                "document_names": document_names,
                "investors": investors,
                "fund_names": fund_options
            }
        )
