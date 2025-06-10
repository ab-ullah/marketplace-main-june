from rest_framework.generics import get_object_or_404, ListCreateAPIView, ListAPIView, CreateAPIView

from api.kyc_records.admin_views.serializers import KYCRecordDetailSerializer, KYCRecordCreateSerializer
from api.kyc_records.models import KYCRecord
from api.mixins.admin_view_mixin import AdminViewMixin
from api.users.models import RetailUser
from api.carry_pools.models import CarryParticipant


class UserKycRecordsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = KYCRecordDetailSerializer

    def get_queryset(self):
        user = get_object_or_404(
            RetailUser,
            id=self.kwargs['user_id'],
            associated_company_users__company=self.company
        )
        return KYCRecord.objects.filter(
            user=user,
            company=self.company,
            kyc_entity__isnull=True
        ).select_related(
            'citizenship_country',
            'home_country',
            'eligibility_country',
            'id_issuing_country',
            'office_location',
            'jurisdiction',
            'investor_location',
            'user',
            'payment_detail',
            'payment_detail__bank_country'
        ).order_by('kyc_investor_type')


class CarryParticipantKycRecordsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = KYCRecordDetailSerializer

    def get_queryset(self):
        user = get_object_or_404(
            RetailUser,
            id=self.kwargs['user_id'],
        )
        return KYCRecord.objects.filter(
            user=user,
            company=self.company,
            kyc_entity__isnull=True
        ).select_related(
            'citizenship_country',
            'home_country',
            'eligibility_country',
            'id_issuing_country',
            'office_location',
            'jurisdiction',
            'investor_location',
            'user',
            'payment_detail'
        ).order_by('kyc_investor_type')


class UserKycRecordsCreateAPIView(AdminViewMixin, CreateAPIView):
    serializer_class = KYCRecordCreateSerializer
    queryset = KYCRecord.objects.all()
