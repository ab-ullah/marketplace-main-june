from datetime import datetime

from django.core.exceptions import ObjectDoesNotExist

from api.employment_records.models import EmploymentRecord
from api.kyc_records.models import KYCRecord


class EmploymentRecordVersionHistory:
    def __init__(self, employment_record: EmploymentRecord, history_date: datetime):
        self.history_date = history_date
        self.employment_record = employment_record

    def get_record(self):
        if not self.history_date:
            return self.employment_record

        return self.get_instance()

    def get_queryset(self, filters):
        if not self.history_date:
            return KYCRecord.objects.filter(**filters)

        return [self.get_record()]

    def get_instance(self):
        try:
            return self.employment_record.history.as_of(self.history_date)
        except ObjectDoesNotExist:
            pass

        try:
            return self.employment_record.history.earliest()
        except ObjectDoesNotExist:
            return self.employment_record

