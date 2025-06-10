from django.db.models import Max
from django.http import Http404

from api.applications.models import Application, UserApplicationState
from api.funds.models import Fund
from api.users.models import RetailUser


def get_user_application_state(application: Application):
    return application.state if application else None


def get_user_application(params: dict):
    if 'user_id' not in params or 'fund__external_id' not in params:
        raise ValueError(
            "The 'user_id' and 'fund__external_id' keys are required to get the application or application state!"
        )

    return Application.objects.filter(**params).latest('created_at')


def get_application_or_404(params: dict):
    if 'user_id' not in params or 'fund__external_id' not in params:
        raise ValueError(
            "The 'user_id' and 'fund__external_id' keys are required to get the application or application state!"
        )

    try:
        return Application.objects.filter(**params).latest('created_at')
    except Application.DoesNotExist:
        raise Http404


def get_user_latest_application_ids(user: RetailUser):
    return Application.objects.filter(
        user=user
    ).values_list(
        'id', flat=True
    ).order_by('fund_id', '-id').distinct('fund_id')


def update_or_create_user_application_state(fund: Fund, user: RetailUser, values: dict):
    application = get_application_or_404({
        'fund__external_id': fund.external_id,
        'user_id': user.id
    })
    instance = application.state
    is_created = False

    if not instance:
        values['fund'] = fund
        values['user'] = user
        instance = UserApplicationState.objects.create(**values)
        is_created = True
    else:
        for attr, value in values.items():
            setattr(instance, attr, value)
        instance.save()

    return instance, is_created


def update_or_create_user_application(fund: Fund, user: RetailUser, values: dict):
    try:
        instance = get_user_application({
            'user_id': user.id,
            'company': fund.company,
            'fund__external_id': fund.external_id,
        })

        for attr, value in values.items():
            setattr(instance, attr, value)
        instance.save()
        return instance, False

    except Application.DoesNotExist:
        values['fund'] = fund
        values['user'] = user
        values['company'] = fund.company
        instance = Application.objects.create(**values)

        return instance, True
