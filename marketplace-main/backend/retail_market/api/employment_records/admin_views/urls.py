from django.urls import path
from .employees_onboarding_upload_views import UploadOnboardEmployeesCSV, CompanyDepartmentsListAPIView, \
    CompanyRolesListAPIView, CompanyJobBandsListAPIView, CompanyOfficeLocationsListAPIView, CompanyFirmViewFilterAPIView
from .employment_record_views import EmploymentRecordCreateAPIView, EmploymentRecordRetrieveUpdateAPIView

UPLOAD_EMPLOYEES_ONBOARDING_FILE_NAME = "employees-onboarding-file-name"
EMPLOYMENT_RECORD_DEPARTMENTS = "employment-record-departments"
EMPLOYMENT_RECORD_JOB_BANDS = "employment-record-job-bands"
EMPLOYMENT_RECORD_OFFICE_LOCATIONS = "employment-record-office-locations"
EMPLOYMENT_RECORD_COMPANY_ROLES = "employment-record-company-roles"
EMPLOYMENT_RECORD_CREATE = "employment-record-create"
EMPLOYMENT_RECORD_UPDATE_RETRIEVE = "employment-record-update-retrieve"
EMPLOYMENT_FILTER_OPTIONS = "employment-record-options-retrieve"

urlpatterns = [
    path('onboarding', UploadOnboardEmployeesCSV.as_view(), name=UPLOAD_EMPLOYEES_ONBOARDING_FILE_NAME),
    path('departments', CompanyDepartmentsListAPIView.as_view(), name=EMPLOYMENT_RECORD_DEPARTMENTS),
    path('job_bands', CompanyJobBandsListAPIView.as_view(), name=EMPLOYMENT_RECORD_JOB_BANDS),
    path('filters', CompanyFirmViewFilterAPIView.as_view(), name=EMPLOYMENT_FILTER_OPTIONS),
    path('office_locations', CompanyOfficeLocationsListAPIView.as_view(), name=EMPLOYMENT_RECORD_OFFICE_LOCATIONS),
    path('company_roles', CompanyRolesListAPIView.as_view(), name=EMPLOYMENT_RECORD_COMPANY_ROLES),
    path('', EmploymentRecordCreateAPIView.as_view(), name=EMPLOYMENT_RECORD_CREATE),
    path('<pk>', EmploymentRecordRetrieveUpdateAPIView.as_view(), name=EMPLOYMENT_RECORD_UPDATE_RETRIEVE),
]
