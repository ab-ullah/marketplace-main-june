from django.contrib import admin

from api.investors.models import Investor


class InvestorAdmin(admin.ModelAdmin):
    list_display = ['id', 'leverage_used']


admin.site.register(Investor, InvestorAdmin)
