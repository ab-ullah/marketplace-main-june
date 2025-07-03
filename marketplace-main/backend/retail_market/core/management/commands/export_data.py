from django.core.management.base import BaseCommand
from django.apps import apps

from api.feature_flags.provider import ID
from core.services.exporter import ExporterService
from api.carry_pools.models import TimeBasedVestingSchedule, MilestoneBasedVestingSchedule


class Command(BaseCommand):
    help = "Export model data with relations"

    def add_arguments(self, parser):
        parser.add_argument('--company_id', type=ID, help='Company ID')
        parser.add_argument('--model', type=str, required=True, help='Model label: app.Model')
        parser.add_argument('--depth', type=int, required=True, help='depth of relations to export (e.g. 1, 2, 3)')
        parser.add_argument('--env', type=str, default='staging', choices=['staging', 'production'])
        parser.add_argument('--output', type=str, required=True)

    def handle(self, *args, **options):
        company_id = options['company_id']
        model = apps.get_model(options['model'])
        contain_company_id = getattr(model, 'company_id', None)

        if model.__name__ == 'VestingSchedule' and company_id:
            print("VestingSchedule model is supported for export")
            time_exporter = ExporterService(depth=options['depth'])
            timeBased_vesting_schedule_qs = TimeBasedVestingSchedule.objects.filter(
                vesting_schedule__company_id=company_id,
            )
            timeBased_vesting_schedule_data = time_exporter.export_queryset(timeBased_vesting_schedule_qs, env=options['env'])

            milestone_exporter = ExporterService(depth=options['depth'])
            milestone_vesting_schedule_qs = MilestoneBasedVestingSchedule.objects.filter(
                vesting_schedule__company_id=company_id,
            )
            milestone_vesting_schedule_data = milestone_exporter.export_queryset(milestone_vesting_schedule_qs, env=options['env'])
            data  = timeBased_vesting_schedule_data + milestone_vesting_schedule_data
            milestone_exporter.save_export_to_file(data, options['output'])
            self.stdout.write(self.style.SUCCESS(f"Exported {len(data)} total objects to {options['output']}"))

        elif model.__name__ == 'VestingSchedule':
            time_exporter = ExporterService(depth=options['depth'])
            timeBased_vesting_schedule_qs = TimeBasedVestingSchedule.objects.all()
            timeBased_vesting_schedule_data = time_exporter.export_queryset(timeBased_vesting_schedule_qs, env=options['env'])

            milestone_exporter = ExporterService(depth=options['depth'])
            milestone_vesting_schedule_qs = MilestoneBasedVestingSchedule.objects.all()
            milestone_vesting_schedule_data = milestone_exporter.export_queryset(milestone_vesting_schedule_qs, env=options['env'])
            data  = timeBased_vesting_schedule_data + milestone_vesting_schedule_data
            milestone_exporter.save_export_to_file(data, options['output'])
            self.stdout.write(self.style.SUCCESS(f"Exported {len(data)} total objects to {options['output']}"))
        else:
            if company_id and contain_company_id:
                queryset = model.objects.filter(company_id=company_id)
            else:
                queryset = model.objects.all()
            exporter = ExporterService(depth=options['depth'])
            data = exporter.export_queryset(queryset, env=options['env'])
            exporter.save_export_to_file(data, options['output'])
            self.stdout.write(self.style.SUCCESS(f"Exported {len(data)} total objects to {options['output']}"))
