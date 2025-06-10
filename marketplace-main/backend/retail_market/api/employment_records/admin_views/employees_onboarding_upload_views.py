import http

from django.http import JsonResponse
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView

from api.documents.services.upload_document import UploadDocumentService
from api.employment_records.constants.filters import DEFAULT_FILTERS
from api.employment_records.models import JobBand, Department, OfficeLocation, CompanyRole, CompanyFirmViewFilter
from api.employment_records.serializers import JobBandSerializer, DepartmentSerializer, OfficeLocationSerializer, \
    CompanyRoleSerializer, CompanyFirmViewFilterSerializer
from api.employment_records.services.onboarding import EmployeesOnboarding
from api.mixins.admin_view_mixin import AdminViewMixin


class UploadOnboardEmployeesCSV(AdminViewMixin, APIView):
    def post(self, request, *args, **kwargs):
        csvfile = request.data['employees_onboarding_file']
        onboarding = EmployeesOnboarding(UploadDocumentService(), self.company)
        try:
            output = onboarding.process(csvfile)
        except Exception as e:
            return JsonResponse(status=http.HTTPStatus.PRECONDITION_FAILED,
                                data={"message": "Invalid CSV file, contact support",
                                      "explicit_error": str(e)})
        onboarding.upload_file(csvfile, self.admin_user)
        if output.successful():
            return JsonResponse(status=http.HTTPStatus.OK,
                                data={"message": f"Successful employees onboarded: {output.successes_count()}"})
        else:
            return JsonResponse(status=http.HTTPStatus.PRECONDITION_FAILED,
                                data={"message": "Incomplete CSV file, contact support",
                                      "errors": [str(error) for error in output.errors]})


class CompanyJobBandsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = JobBandSerializer
    queryset = JobBand.objects.select_related('company')


class CompanyDepartmentsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = DepartmentSerializer
    queryset = Department.objects.select_related('company')


class CompanyOfficeLocationsListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = OfficeLocationSerializer
    queryset = OfficeLocation.objects.select_related('company')


class CompanyRolesListAPIView(AdminViewMixin, ListAPIView):
    serializer_class = CompanyRoleSerializer
    queryset = CompanyRole.objects.select_related('company')


class CompanyFirmViewFilterAPIView(AdminViewMixin, RetrieveAPIView):
    serializer_class = CompanyFirmViewFilterSerializer

    def get_object(self):
        firm_filter, _ = CompanyFirmViewFilter.objects.get_or_create(
            company=self.company,
            defaults={
                'filters': DEFAULT_FILTERS
            }
        )
        return firm_filter
