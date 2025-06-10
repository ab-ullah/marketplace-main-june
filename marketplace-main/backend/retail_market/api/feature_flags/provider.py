import logging
from typing import Union, List

from django.db import transaction
from pydantic import BaseModel, RootModel

from api.feature_flags.models import CompanyFeatureFlag as CompanyFeatureFlagModel, Feature as FeatureModel

ID = int

logger = logging.getLogger()


class FeatureFlag(BaseModel):

    def is_active(self, feature):
        raise NotImplementedError("Please implement me...")

    def activate(self, feature):
        raise NotImplementedError("Please implement me...")

    def deactivate(self, feature):
        raise NotImplementedError("Please implement me...")


class CompanyFeatureFlagProvider(FeatureFlag):
    company_id: ID

    def _queryset(self, feature):
        return CompanyFeatureFlagModel.objects.filter(feature__name=feature, company_id=self.company_id)

    def is_active(self, feature):
        return self._queryset(feature).filter(active=True).exists()

    def activate(self, feature):
        with transaction.atomic():
            feature_instance, created = FeatureModel.objects.get_or_create(name=feature)
            if created:
                logger.info(f"Created feature: {feature}")
            company_feature, created = CompanyFeatureFlagModel.objects.update_or_create(feature=feature_instance,
                                                                                        company_id=self.company_id,
                                                                                        defaults={'active': True})
            if created:
                logger.info(f"Created company feature flag {feature} and activated")
            else:
                logger.info(f"Activated company feature flag {feature}")

    def deactivate(self, feature):
        self._queryset(feature).update(active=False)


class MultiCompanyFeatureFlagProvider(FeatureFlag):
    company_ids: List[ID]

    def is_active(self, feature):
        return self._queryset(feature).filter(active=True).exists()

    def _queryset(self, feature):
        return CompanyFeatureFlagModel.objects.filter(feature__name=feature, company_id__in=self.company_ids)

    def activate(self, feature):
        raise RuntimeError("You shouldn't activate feature flags for multiple companies")

    def deactivate(self, feature):
        raise RuntimeError("You shouldn't deactivate feature flags for multiple companies")


class FeatureFlagProvider(RootModel):
    root: Union[CompanyFeatureFlagProvider, MultiCompanyFeatureFlagProvider]

    def is_active(self, feature: str) -> bool:
        return self.root.is_active(feature)

    def activate(self, feature: str):
        return self.root.activate(feature)

    def deactivate(self, feature: str):
        return self.root.deactivate(feature)

    @classmethod
    def from_params(cls, **kwargs):
        return cls.model_validate(kwargs)

