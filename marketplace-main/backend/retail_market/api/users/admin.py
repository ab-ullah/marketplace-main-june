from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from api.users.models import RetailUser


class RetailUserAdmin(UserAdmin):
    list_display = ['username', 'first_name', 'last_name']


admin.site.register(RetailUser, RetailUserAdmin)
