import base64
import csv
import io
from datetime import date, datetime
from decimal import Decimal
from typing import List, Dict

import pandas as pd
from dateutil.parser import parse as dt_parse
from django.db.models import Subquery, Sum
from django.template.loader import render_to_string
from slugify import slugify

from api.carry_pools.models import CarryPool, CarryPlan, AllocationAction, CarryVehicle, \
    CarryShareClass, CarryParticipant, FundCarryPlan, DealCarryPlan, InvestmentTrancheCarryPlan, \
    CarrySubPool
from api.carry_pools.serializers import CompanyCarryPlansExportSerializer, CompanyAllocationsExportSerializer
from api.carry_pools.services.calculate_vested_points import CalculateVestedPointsService
from api.carry_pools.services.constants import COLUMN_MAPPING, ALLOCATIONS_EXPORT_COLUMN_ORDER, \
    ALLOCATIONS_EXPORT_COLUMN_MAPPING
from api.carry_pools.services.user_carry_allocation_service import UserCarryAllocationService
from api.companies.models import Company
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_logo_url


class ProcessCarryPool:
    def __init__(self, calculation_date: date, company: Company, pool_id: int):
        self.calculation_date = calculation_date
        self.company = company
        self.carry_pool = self.get_carry_pool(pool_id)
        self.forfeited_bps_dict = {}
        self.diluted_bps_dict = {}

    def get_carry_pool(self, pool_id):
        return CarryPool.objects.get(id=pool_id, company=self.company)

    def process(self):
        allocations = self.carry_pool.allocations
        if not allocations:
            return None
        allocation_ids = [allocation['allocation_id'] for allocation in allocations]
        self.prepare_forfeited_diluted_points(allocation_ids)
        for allocation in allocations:
            self.adjust_forfeited_bps(allocation)
            self.adjust_diluted_bps(allocation)
            self.get_updated_vested_points(allocation)
        return allocations

    def adjust_forfeited_bps(self, allocation):
        forfeited_bps = self.forfeited_bps_dict.get(allocation['allocation_id'], 0)
        allocation['forfeited_bps'] = forfeited_bps

        forfeited_bps_decimal = Decimal(str(forfeited_bps))
        bps_decimal = Decimal(str(allocation['bps']))
        remainder_decimal = bps_decimal - forfeited_bps_decimal

        allocation['bps'] = float(remainder_decimal)

    def adjust_diluted_bps(self, allocation):
        diluted_bps = self.diluted_bps_dict.get(allocation['allocation_id'], 0)
        allocation['diluted_bps'] = diluted_bps

        diluted_bps_decimal = Decimal(str(diluted_bps))
        bps_decimal = Decimal(str(allocation['bps']))
        remainder_decimal = bps_decimal - diluted_bps_decimal

        allocation['bps'] = float(remainder_decimal)

    def get_updated_vested_points(self, allocation):
        if not allocation.get('initial_bps'):
            allocation['initial_bps'] = allocation['bps']

        result = CalculateVestedPointsService({
            'base_pool_id': self.carry_pool.external_id,
            'parent_pool_id': self.carry_pool.external_id,
            'allocation_id': allocation['allocation_id'],
            'company_id': self.company.id,
            'vesting_calculation_date': self.calculation_date,
            'allocation': allocation
        }).calculate_vested_points()

        allocation['vested_bps'] = float(result['vested_points'])
        return allocation

    def prepare_forfeited_diluted_points(self, allocation_ids):
        aggregated_data = AllocationAction.objects.filter(
            allocation_id__in=allocation_ids,
            type=AllocationAction.Type.FORFEIT.value,
            grant_date__date__lte=self.calculation_date
        ).values('allocation_id').annotate(forfeited_bps=Sum('bps'))

        self.forfeited_bps_dict = {item['allocation_id']: item['forfeited_bps'] for item in aggregated_data}

        diluted_data = AllocationAction.objects.filter(
            allocation_id__in=allocation_ids,
            type=AllocationAction.Type.DILUTE.value,
            grant_date__date__lte=self.calculation_date
        ).values('allocation_id').annotate(diluted_bps=Sum('bps'))

        self.diluted_bps_dict = {item['allocation_id']: item['diluted_bps'] for item in diluted_data}


class CreateCompanyCarryPlansReport:
    def __init__(self, calculation_date, company: Company, email: str):
        self.calculation_date = calculation_date
        self.company = company
        self.email = email
        self.vehicle_name_map = self.get_vehicle_mappings()
        self.share_class_map = self.get_share_class_mappings()
        self.participant_name_map = self.get_participant_mappings()

    def get_vehicle_mappings(self):
        vehicles = CarryVehicle.objects.filter(company=self.company)
        vehicle_name_map = {}
        for vehicle in vehicles:
            vehicle_name_map[vehicle.id] = vehicle.legal_name
        return vehicle_name_map

    def get_share_class_mappings(self):
        share_classes = CarryShareClass.objects.filter(company=self.company)
        share_class_name_map = {}
        for share_class in share_classes:
            share_class_name_map[share_class.id] = share_class.legal_name
        return share_class_name_map

    def get_participant_mappings(self):
        participants = CarryParticipant.objects.filter(company=self.company)
        participant_name_map = {}
        for participant in participants:
            participant_name_map[participant.id] = participant.get_full_name()

        return participant_name_map

    def get_carry_plans(self):
        last_carry_pool = CarryPool.objects.last_carry_pool_qs()
        qs = CarryPlan.objects.filter(company=self.company) \
            .select_related(
            'default_vesting_schedule',
        ).annotate(
            latest_pool_id=Subquery(last_carry_pool.values('id')),
        )
        return list(qs)

    def process_carry_plans(self):
        carry_plans = self.get_carry_plans()
        data = {}
        for carry_plan in carry_plans:
            allocations = ProcessCarryPool(
                calculation_date=self.calculation_date,
                company=self.company,
                pool_id=carry_plan.latest_pool_id
            ).process()
            if allocations:
                formatted_allocations = self.format_allocations(allocations=allocations)
                data[carry_plan.name] = formatted_allocations

        self.send_excel(data=data)

    def format_allocations(self, allocations):
        formatted_allocations = []
        for allocation in allocations:
            if allocation.get('vehicle'):
                allocation['vehicle'] = self.vehicle_name_map.get(allocation['vehicle'])

            if allocation.get('share_class'):
                allocation['share_class'] = self.share_class_map.get(allocation['share_class'])

            if allocation.get('carry_participant_id'):
                allocation['participant'] = self.participant_name_map.get(allocation['carry_participant_id'])

            if not allocation.get('participant'):
                continue

            allocation['vested'] = allocation.get('vested_bps', 0)
            allocation['total'] = allocation.get('bps', 0)

            formatted_allocation_serializer = CompanyCarryPlansExportSerializer(data=allocation)
            formatted_allocation_serializer.is_valid(raise_exception=True)
            formatted_allocation = formatted_allocation_serializer.data
            for target_key, destination_key in COLUMN_MAPPING.items():
                formatted_allocation[destination_key] = formatted_allocation.pop(target_key, '')

            formatted_allocations.append(formatted_allocation)
        return formatted_allocations

    def format_calculation_date(self):
        try:
            return dt_parse(self.calculation_date).strftime("%m/%d/%Y")
        except:
            return self.calculation_date


    def send_excel(self, data):
        data_frames = {}
        for carry_plan, allocations in data.items():
            df = pd.DataFrame(allocations)

            data_frames[carry_plan] = df

        in_memory_fp = io.BytesIO()
        formatted_date = self.format_calculation_date()
        with pd.ExcelWriter(in_memory_fp, engine='openpyxl') as writer:
            for carry_plan, df in data_frames.items():
                df.to_excel(writer, sheet_name=slugify(carry_plan), index=False)

        in_memory_fp.seek(0)
        encoded_file = base64.b64encode(in_memory_fp.getvalue()).decode()

        email_service = SendEmailService()
        company_name = self.company.name
        to = self.email
        subject = f"Carry plan exports for {company_name}: {formatted_date}"
        context = {
            "logo_url": get_logo_url(company=self.company),
            "company_name": company_name,
            "formatted_date": formatted_date,
        }
        body = render_to_string("email/company_carry_export.html", context).strip()
        to = [email.strip() for email in to.split(',')]
        email_service.send_email_with_attachment(
            to=to,
            subject=subject,
            body=body,
            attachment_file=encoded_file,
            file_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            attachment_file_name=f'export-{self.calculation_date}.xlsx'
        )


class CreateAllocationsReport:
    def __init__(self, calculation_date, company: Company, email: str):
        self.calculation_date = calculation_date
        self.company = company
        self.email = email
        self.vehicle_name_map = self.get_vehicle_mappings()
        self.share_class_map = self.get_share_class_mappings()
        self.participant_name_map = self.get_participant_mappings()
        self.source_name_map = self.get_source_name_mappings()
        self.subpool_name_map = self.get_subpool_name_mappings()

    def get_vehicle_mappings(self):
        vehicles = CarryVehicle.objects.filter(company=self.company)
        vehicle_name_map = {}
        for vehicle in vehicles:
            vehicle_name_map[vehicle.id] = vehicle.legal_name
        return vehicle_name_map

    def get_share_class_mappings(self):
        share_classes = CarryShareClass.objects.filter(company=self.company)
        share_class_name_map = {}
        for share_class in share_classes:
            share_class_name_map[share_class.id] = share_class.legal_name
        return share_class_name_map

    def get_participant_mappings(self):
        participants = CarryParticipant.objects.filter(company=self.company)
        participant_name_map = {}
        for participant in participants:
            participant_name_map[participant.id] = participant.get_full_name()

        return participant_name_map

    def get_source_name_mappings(self):
        fund_carry_plans = FundCarryPlan.objects.filter(fund__company=self.company).select_related('fund', 'carry_plan')
        deal_carry_plans = DealCarryPlan.objects.filter(deal__company=self.company).select_related('deal', 'carry_plan')
        investment_tranch_carry_plans = InvestmentTrancheCarryPlan.objects.filter(investment_tranche__company=self.company).select_related('investment_tranche', 'carry_plan')
        source_name_map = {}
        for fund_carry_plan in fund_carry_plans:
            source_name_map[fund_carry_plan.carry_plan.id] = fund_carry_plan.fund.name
            
        for deal_carry_plan in deal_carry_plans:
            source_name_map[deal_carry_plan.carry_plan.id] = deal_carry_plan.deal.name
            
        for investment_tranch_carry_plan in investment_tranch_carry_plans:
            source_name_map[investment_tranch_carry_plan.carry_plan.id] = investment_tranch_carry_plan.investment_tranche.name

        return source_name_map
    
    def get_subpool_name_mappings(self):
        all_subpools = CarrySubPool.objects.filter(carry_plan__company=self.company)
        subpool_name_map = {}
        for subpool in all_subpools:
            subpool_name_map[subpool.id] = subpool.name
        return subpool_name_map

    def get_carry_plans(self):
        last_carry_pool = CarryPool.objects.last_carry_pool_qs()
        qs = CarryPlan.objects.filter(company=self.company) \
            .select_related(
            'default_vesting_schedule',
        ).annotate(
            latest_pool_id=Subquery(last_carry_pool.values('id')),
        )
        return list(qs)

    def process_allocations(self, carry_participant_ids):
        service = UserCarryAllocationService(
            carry_participant_ids=carry_participant_ids,
            company_id=self.company.id,
            calculation_date=self.calculation_date
        )
        allocations_response = service.get_user_data()
        res = []
        allocations_response = sorted(
            allocations_response,
            key=lambda d: datetime.strptime(d['grant_date'], '%Y-%m-%d'),
            reverse=True
        )
        for allocation in allocations_response:
            formatted_allocation = self.format_allocation(allocation)
            res.append(formatted_allocation)
        return res
    
    def send_csv(self, data: List[Dict]):
        in_memory_fp = io.StringIO()
        writer = csv.DictWriter(in_memory_fp, fieldnames=ALLOCATIONS_EXPORT_COLUMN_ORDER)
        writer.writeheader()
        for row in data:
            writer.writerow(row)
        in_memory_fp.seek(0)
        encoded_file = base64.b64encode(in_memory_fp.getvalue().encode()).decode()
        company_name = self.company.name
        email_service = SendEmailService()
        to = self.email
        formatted_date = self.format_calculation_date()
        subject = f"Carry plan allocations exports for {company_name}: {formatted_date}"
        context = {
            "logo_url": get_logo_url(company=self.company),
            "company_name": company_name,
            "formatted_date": formatted_date,
        }
        body = render_to_string("email/company_allocations_export.html", context).strip()
        to = [email.strip() for email in to.split(',')]
        email_service.send_email_with_attachment(
            to=to,
            subject=subject,
            body=body,
            attachment_file=encoded_file,
            file_type='application/csv',
            attachment_file_name=f'export-{self.calculation_date}.csv'
        )

    def format_allocation(self, allocation):
        if allocation.get('vehicle'):
            allocation['vehicle'] = self.vehicle_name_map.get(allocation['vehicle'])

        if allocation.get('share_class'):
            allocation['share_class'] = self.share_class_map.get(allocation['share_class'])

        if allocation.get('carry_participant_id'):
            allocation['participant'] = self.participant_name_map.get(allocation['carry_participant_id'])
        
        if allocation.get('carry_plan_id'):
            allocation['source'] = self.source_name_map.get(int(allocation['carry_plan_id']), "")
        
        if allocation.get('sub_pool_id'):
            allocation['sub_pool_name'] = self.subpool_name_map.get(int(allocation['sub_pool_id']), "")
        
        if not allocation.get('participant'):
            return

        allocation['vested'] = allocation.get('vested_bps', 0)
        allocation['points'] = allocation.get('bps', 0)
        allocation['vesting_schedule'] = (allocation.get('vesting_schedule_id', {})).get('name', '')
        allocation['estimated_value'] = allocation.get('participant_estimated_carry', 0)
        allocation['estimated_value_vested'] = allocation.get('participant_estimated_carry_vested', 0)
        allocation['estimated_value_unvested'] = allocation.get('participant_estimated_carry_un_vested', 0)
        allocation['fair_market_value'] = allocation.get('participant_fair_market_value', 0)
        allocation['vested_fair_market_value'] = allocation.get('participant_fair_market_value_vested', 0)
        allocation['unvested_fair_market_value'] = allocation.get('participant_fair_market_value_un_vested', 0)
        allocation['participant'] = allocation.get('entity_name') or allocation.get('full_name')
        allocation['fair_market_value_as_of'] = allocation.get('fair_market_value_date', None)
        allocation['estimated_value_as_of'] = allocation.get('estimated_value_date', None)

        formatted_allocation_serializer = CompanyAllocationsExportSerializer(data=allocation)
        formatted_allocation_serializer.is_valid(raise_exception=True)
        formatted_allocation = formatted_allocation_serializer.data
        for target_key, destination_key in ALLOCATIONS_EXPORT_COLUMN_MAPPING.items():
            formatted_allocation[destination_key] = formatted_allocation.pop(target_key, '')

        return formatted_allocation

    def format_calculation_date(self):
        try:
            return dt_parse(self.calculation_date).strftime("%m/%d/%Y")
        except:
            return self.calculation_date


def async_company_carry_plan_export_task(d: str, company_id: int, email: str):
    company = Company.objects.get(id=company_id)
    CreateCompanyCarryPlansReport(
        calculation_date=d,
        company=company,
        email=email
    ).process_carry_plans()


def async_company_allocations_export_task(d: str, company_id: int, email: str):
    company = Company.objects.get(id=company_id)
    carry_participant_ids = list(CarryParticipant.objects.filter(company=company).values_list('id', flat=True))
    report = CreateAllocationsReport(
        calculation_date=d,
        company=company,
        email=email
    )
    allocs = report.process_allocations(carry_participant_ids)
    report.send_csv(allocs)
