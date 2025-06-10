from django.db.models import Sum

from api.carry_pools.models import CarryGpCommitment
from api.carry_pools.serializers import CarryGpCommitmentSerializer
from api.carry_pools.utils import get_gp_commit_source_name


class GpCommitService:

    def __init__(self, company):
        self.company = company

    def prepare_formatted_data(self):
        data = []
        gp_commits = CarryGpCommitment.objects.filter(company=self.company).values(
            'source_external_id', 'source_type'
        ).annotate(
            total_capital_commit_sum=Sum('total_capital_commit'),
            cashless_commit_sum=Sum('cashless_commit'),
            management_fee_offset_sum=Sum('management_fee_offset'),
            salary_reduction_sum=Sum('salary_reduction')
        )

        for gp_commit in gp_commits:
            gp_object = {
                'source_name': get_gp_commit_source_name(
                    gp_commit['source_type'],
                    gp_commit['source_external_id'],
                    self.company
                ),
                'source_type': gp_commit['source_type'],
                'source_external_id': gp_commit['source_external_id'],
                'total_capital_commit': gp_commit['total_capital_commit_sum'],
                'cashless_commit': gp_commit['cashless_commit_sum'],
                'management_fee_offset': gp_commit['management_fee_offset_sum'],
                'salary_reduction': gp_commit['salary_reduction_sum']
            }
            data.append(gp_object)

        return data

    def prepare_formatted_data_participants(self, source_external_id, source_type):
        data = {}
        gp_commits = CarryGpCommitment.objects.filter(
            company=self.company,
            source_external_id=source_external_id,
            source_type=source_type
        )

        total_capital_commit_sum = 0
        cashless_commit_sum = 0
        management_fee_offset_sum = 0
        salary_reduction_sum = 0
        for gp_commit in gp_commits:
            total_capital_commit_sum += gp_commit.total_capital_commit or 0
            cashless_commit_sum += gp_commit.cashless_commit or 0
            management_fee_offset_sum += gp_commit.management_fee_offset or 0
            salary_reduction_sum += gp_commit.salary_reduction or 0
        data['total_capital_commit_sum'] = total_capital_commit_sum
        data['cashless_commit_sum'] = cashless_commit_sum
        data['management_fee_offset_sum'] = management_fee_offset_sum
        data['salary_reduction_sum'] = salary_reduction_sum

        data['participants'] = CarryGpCommitmentSerializer(gp_commits, many=True).data
        data['source_name'] = get_gp_commit_source_name(source_type, source_external_id, self.company)
        return data


    def prepare_formatted_data_for_user(self, carry_participant_ids):
        data = []
        gp_commits = CarryGpCommitment.objects.filter(
            company=self.company,
            carry_participant_id__in=carry_participant_ids
        ).values(
            'source_external_id', 'source_type'
        ).annotate(
            total_capital_commit_sum=Sum('total_capital_commit'),
            cashless_commit_sum=Sum('cashless_commit'),
            management_fee_offset_sum=Sum('management_fee_offset'),
            salary_reduction_sum=Sum('salary_reduction')
        )

        for gp_commit in gp_commits:
            gp_object = {
                'source_name': get_gp_commit_source_name(
                    gp_commit['source_type'],
                    gp_commit['source_external_id'],
                    self.company
                ),
                'source_type': gp_commit['source_type'],
                'source_external_id': gp_commit['source_external_id'],
                'total_capital_commit': gp_commit['total_capital_commit_sum'],
                'cashless_commit': gp_commit['cashless_commit_sum'],
                'management_fee_offset': gp_commit['management_fee_offset_sum'],
                'salary_reduction': gp_commit['salary_reduction_sum']
            }
            data.append(gp_object)

        return data


    @staticmethod
    def prepare_formatted_data_for_investor_dashboard(carry_participant_ids, company_ids):
        data = []
        gp_commits = CarryGpCommitment.objects.filter(
            company_id__in=company_ids,
            carry_participant_id__in=carry_participant_ids
        ).select_related('company').values(
            'source_external_id', 'source_type', 'company'
        ).annotate(
            total_capital_commit_sum=Sum('total_capital_commit'),
            cashless_commit_sum=Sum('cashless_commit'),
            management_fee_offset_sum=Sum('management_fee_offset'),
            salary_reduction_sum=Sum('salary_reduction')
        )

        for gp_commit in gp_commits:
            gp_object = {
                'source_name': get_gp_commit_source_name(
                    gp_commit['source_type'],
                    gp_commit['source_external_id'],
                    gp_commit['company']
                ),
                'source_type': gp_commit['source_type'],
                'source_external_id': gp_commit['source_external_id'],
                'total_capital_commit': gp_commit['total_capital_commit_sum'],
                'cashless_commit': gp_commit['cashless_commit_sum'],
                'management_fee_offset': gp_commit['management_fee_offset_sum'],
                'salary_reduction': gp_commit['salary_reduction_sum']
            }
            data.append(gp_object)

        return data

    def delete_for_participants(self, source_external_id, source_type):
        CarryGpCommitment.objects.filter(
            company=self.company,
            source_external_id=source_external_id,
            source_type=source_type
        ).update(deleted=True)
        return {'msg': 'Deleted Successfully!'}
