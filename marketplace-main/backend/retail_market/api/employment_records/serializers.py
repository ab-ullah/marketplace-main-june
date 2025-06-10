from rest_framework import serializers

from api.employment_records.models import EmploymentRecord, JobBand, Department, OfficeLocation, CompanyRole, \
    CostCenter, BusinessUnit, CompanyFirmViewFilter
from api.employment_records.services.firm_view_filters import FirmViewFilters


class EmploymentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentRecord
        exclude = ('created_at',)

    def create(self, validated_data):
        validated_data['company'] = self.context['company']
        return super().create(validated_data)


class JobBandSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobBand
        fields = ('name', 'id', )


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('name', 'id', )


class OfficeLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficeLocation
        fields = ('name', 'id', )


class CompanyRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyRole
        fields = ('name', 'id', )


class OrgImportSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    ein = serializers.CharField(max_length=16, required=False, allow_null=True, allow_blank=True)
    business_unit = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    title = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    functional_role = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)
    manager_ein = serializers.CharField(max_length=16, required=False, allow_null=True, allow_blank=True)
    office_location = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    cost_center = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    investor_account_code = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    company_id = serializers.IntegerField(required=True)

    def validate(self, attrs):
        # TODO: Once we have loaded the options, we can add back these
        # if functional_role := attrs.get('functional_role'):
        #     if not CompanyRole.objects.filter(name__iexact=functional_role, company_id=attrs['company_id']).exists():
        #         raise serializers.ValidationError(f"Functional role {functional_role} does not exist")
        #
        # if cost_center := attrs.get('cost_center'):
        #     if not CostCenter.objects.filter(name__iexact=cost_center, company_id=attrs['company_id']).exists():
        #         raise serializers.ValidationError(f"Cost center {cost_center} does not exist")
        #
        # if business_unit := attrs.get('business_unit'):
        #     if not BusinessUnit.objects.filter(name__iexact=business_unit, company_id=attrs['company_id']).exists():
        #         raise serializers.ValidationError(f"Business unit {business_unit} does not exist")

        return attrs


class CompanyFirmViewFilterSerializer(serializers.ModelSerializer):
    filters_options = serializers.SerializerMethodField()

    class Meta:
        model = CompanyFirmViewFilter
        fields = '__all__'

    @staticmethod
    def get_filters_options(obj: CompanyFirmViewFilter):
        return FirmViewFilters(obj.company).get_filters()

