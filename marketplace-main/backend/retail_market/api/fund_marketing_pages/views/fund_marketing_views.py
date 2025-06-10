from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView, DestroyAPIView, \
    ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from api.admin_users.models import AdminUser
from api.companies.models import CompanyUser
from api.fund_marketing_pages.models import FundMarketingPage, FundFact, RequestAllocationCriteria, FooterBlock, \
    FundPageDocument, RequestAllocationDocument, PromoFile, IconOption, \
    FundMarketingPageContact, FundMarketingPageReviewer
from api.fund_marketing_pages.serializers import FundMarketingPageSerializer, FundFactSerializer, \
    RequestAllocationCriteriaSerializer, FooterBlockSerializer, FundMarketingPageDetailSerializer, \
    FundMarketingPageDocumentSerializer, RequestAllocationDocumentCreateSerializer, PromoFileSerializer, \
    AvailableReviewerSerializer, IconOptionSerializer, ContactSerializer, FundMarketingPageReviewerSerializer
from api.mixins.admin_view_mixin import AdminViewMixin

from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser


class FundMarketingListCreateAPIView(AdminViewMixin, ListCreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundMarketingPageSerializer

    def get_queryset(self):
        queryset = FundMarketingPage.objects.all()
        fund_id = self.request.GET.get('fund_id')
        if fund_id:
            queryset = queryset.filter(fund_id=int(fund_id))
        return queryset.prefetch_related('created_by').prefetch_related('created_by__user')


class FundMarketingRetrieveUpdateDeleteAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundMarketingPageDetailSerializer
    queryset = FundMarketingPage.objects.all()


class FundFactCreateAPIView(CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundFactSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return FundFact.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class PromoFileCreateAPIView(CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = PromoFileSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return PromoFile.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class PromoFileDeleteAPIView(DestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = PromoFileSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return PromoFile.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class FundFactRetrieveUpdateDeleteAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundFactSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return FundFact.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class RequestAllocationCriteriaCreateAPIView(CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = RequestAllocationCriteriaSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return RequestAllocationCriteria.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class RequestAllocationCriteriaRetrieveUpdateDeleteAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = RequestAllocationCriteriaSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return RequestAllocationCriteria.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class ContactRetrieveUpdateDeleteAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = ContactSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return FundMarketingPageContact.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class FooterBlockCreateAPIView(CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FooterBlockSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return FooterBlock.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class FooterBlockRetrieveUpdateDeleteAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FooterBlockSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return FooterBlock.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class FundMarketingDocumentCreateAPIView(AdminViewMixin, CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = FundMarketingPageDocumentSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return FundPageDocument.objects.filter(fund_marketing_page_id=fund_marketing_page_id)


class RequestAllocationDocumentCreateAPIView(AdminViewMixin, CreateAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = RequestAllocationDocumentCreateSerializer

    def get_queryset(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        return RequestAllocationDocument.objects.filter(
            allocation_criteria__fund_marketing_page_id=fund_marketing_page_id
        )


class FundMarketingPageReviewersAPIView(AdminViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def get_criteria_reviewers_response(self):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        current_reviewers = FundMarketingPageReviewer.objects.filter(fund_marketing_page_id=fund_marketing_page_id)
        current_reviewer_ids = list(current_reviewers.values_list('reviewer_id', flat=True))

        current_reviewer_ids.append(self.admin_user.id)
        not_invited_reviewers = AdminUser.objects.exclude(
            id__in=current_reviewer_ids
        )
        return Response(
            {
                'reviewers': FundMarketingPageReviewerSerializer(current_reviewers, many=True).data,
                'available_reviewers': AvailableReviewerSerializer(not_invited_reviewers, many=True).data
            }
        )

    def get(self, request, *args, **kwargs):
        return self.get_criteria_reviewers_response()

    def post(self, request, *args, **kwargs):
        fund_marketing_page_id = self.kwargs.get('fund_marketing_page_id')
        for user in request.data.get('users'):
            FundMarketingPageReviewer.objects.create(
                fund_marketing_page_id=fund_marketing_page_id,
                reviewer_id=user
            )
        return self.get_criteria_reviewers_response()


class FundMarketingPageReviewerDeleteAPIView(DestroyAPIView):
    permission_classes = (IsSidecarAdminUser,)
    queryset = FundMarketingPageReviewer.objects.all()


class IconOptionsListAPIView(ListAPIView):
    permission_classes = (IsSidecarAdminUser,)
    queryset = IconOption.objects.all()
    serializer_class = IconOptionSerializer
