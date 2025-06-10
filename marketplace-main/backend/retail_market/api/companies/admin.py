from django.contrib import admin

from api.companies.models import Company, CompanyUser


class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'id', 'is_enabled']


class CompanyUserAdmin(admin.ModelAdmin):
    list_display = ['user', 'id', 'company', 'role']


admin.site.register(Company, CompanyAdmin)
admin.site.register(CompanyUser, CompanyUserAdmin)
