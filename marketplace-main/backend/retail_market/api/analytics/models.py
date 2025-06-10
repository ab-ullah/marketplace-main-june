from django.db import models
from api.models import BaseModel

class EntityAction(BaseModel):
    # These are the modules in the platform whose actions we want to track
    class Module(models.IntegerChoices):
        COMPANY = 1
        INVESTMENTS = 2
    # These are the models (entities) we want to track actions when a user sees or takes
    # some action
    class Entity(models.IntegerChoices):
        FUND = 1

    # This is the list of actions we want to analyze.
    class Action(models.IntegerChoices):
        VIEW_MARKETING_PAGE = 1
        VIEW_INDICATION_OF_INTEREST = 2

    # For ease of finding all the events for a single company (without joining through company user or assuming the entity has a company)
    # This will also let us adapt the model in the future, when a user can belong to more than one company
    # so this company is the one who 'owns' the entity the action is taken on.
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE,
                                help_text="The company this view belongs to")

    # Allow blank because the serializer will set the module based on the entity.
    module = models.IntegerField(choices=Module.choices)
    entity = models.IntegerField(choices=Entity.choices)
    entity_id = models.IntegerField()
    user_action = models.IntegerField(choices=Action.choices)
    user = models.ForeignKey('companies.CompanyUser', on_delete=models.CASCADE,
                             help_text="Which user triggered this view")

    view_count = models.IntegerField(blank=True, default=0, help_text="The number of times this action has been taken on this entity")

    class Meta:
        # The combination of module, entity, entity_id, action and user is unique
        constraints = [
            models.UniqueConstraint(fields=['module', 'entity', 'entity_id', 'user_action', 'user'],
                                    name="unique_entity_user_action")
        ]

class EntityStats():

    @staticmethod
    def count_visited_fund_page(fund):
        return EntityAction.objects.filter(entity=EntityAction.Entity.FUND, entity_id=fund.id,
                                    user_action=EntityAction.Action.VIEW_MARKETING_PAGE).count()

    @staticmethod
    def count_visited_interest_page(fund):
        return EntityAction.objects.filter(entity=EntityAction.Entity.FUND, entity_id=fund.id,
                                    user_action=EntityAction.Action.VIEW_INDICATION_OF_INTEREST).count()
