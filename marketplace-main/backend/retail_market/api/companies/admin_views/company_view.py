from django.contrib.auth.models import Group
from django.db.models import Prefetch
from rest_framework.generics import (
    RetrieveUpdateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView, ListAPIView, UpdateAPIView
)

from api.admin_users.serializers import GroupWithAdminUsersSerializer
from api.companies.admin_views.serializers import CompanySerializer, CompanyProfileSerializer, \
    CompanyDocumentSerializer, CompanyReportSerializer, CompanyDocumentOptionSerializer
from api.companies.models import CompanyProfile, CompanyDocument, Company, CompanyReportDocument
from api.mixins.admin_view_mixin import AdminViewMixin


class CompanyRetrieveUpdateAPIView(AdminViewMixin, RetrieveUpdateAPIView):
    serializer_class = CompanySerializer

    def get_object(self):
        company = self.company
        if not hasattr(company, 'company_profile'):
            CompanyProfile.objects.create(company=company)
        return Company.objects.select_related('company_profile').prefetch_related(
            Prefetch(
                'company_required_documents',
                queryset=CompanyDocument.objects.filter(deleted=False)
            )
        ).get(id=company.id)


class CompanyProfileRetrieveUpdateAPIView(AdminViewMixin, RetrieveUpdateAPIView):
    serializer_class = CompanyProfileSerializer

    def get_object(self):
        company = self.company
        company_profile, _ = CompanyProfile.objects.get_or_create(company=company)
        return company_profile


class CompanyDocumentsListCreateAPIView(AdminViewMixin, ListCreateAPIView):
    serializer_class = CompanyDocumentSerializer

    def get_queryset(self):
        return CompanyDocument.objects.filter(company=self.company, deleted=False)

class CompanyDocumentsOptionsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = CompanyDocumentOptionSerializer

    def get_queryset(self):
        return CompanyDocument.objects.filter(
            company=self.company,
            deleted=False,
            require_signature=True
        )

class CompanyDocumentRetrieveUpdateDestroyAPIView(AdminViewMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = CompanyDocumentSerializer

    def get_queryset(self):
        return CompanyDocument.objects.filter(company=self.company, deleted=False)

    def perform_destroy(self, instance):
        instance.deleted = True
        instance.save(update_fields=['deleted'])


class CompanyGroupListView(AdminViewMixin, ListAPIView):
    serializer_class = GroupWithAdminUsersSerializer

    def get_queryset(self):
        return Group.objects.all()


class AddGroupUsersAPIView(AdminViewMixin, UpdateAPIView):
    serializer_class = GroupWithAdminUsersSerializer

    def get_queryset(self):
        return Group.objects.all()


class CompanyReportListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = CompanyReportSerializer
    queryset = CompanyReportDocument.objects.select_related('document').prefetch_related('vehicles')
