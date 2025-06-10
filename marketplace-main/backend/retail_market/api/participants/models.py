from django.db import models
from simple_history.models import HistoricalRecords

from api.models import BaseModel
from core.managers.has_company_filter_manager import HasCompanyFilterManager


# Create your models here.
class ParticipantProfile(BaseModel):
    employment_record = models.OneToOneField('employment_records.EmploymentRecord', null=True,
                                             on_delete=models.CASCADE)
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE)
    objects = HasCompanyFilterManager()
    history = HistoricalRecords()
    user = models.OneToOneField(
        'users.RetailUser',
        on_delete=models.CASCADE,
        related_name='user_participant_profile'
    )

    # add the rest here for
    # https://www.notion.so/sidecar-financial/Admin-user-introduce-participant-show-view-from-the-participant-index-on-the-top-level-nav-132b119616a6495498799f98f97e5a81?pvs=4

    class Meta:
        db_table = 'participant_profiles'
