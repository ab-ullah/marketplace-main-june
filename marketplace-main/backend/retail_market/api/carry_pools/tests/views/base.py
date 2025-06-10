from typing import List

from django.urls import reverse

from api.carry_pools.entities import Allocation
from core.base_tests import BaseTestCase


class CarryTestCase(BaseTestCase):

    def add_participants(self, pool_external_id, allocations: List[Allocation], carry_plan_id):
        url = reverse('carry-plan-allocations', kwargs={'pk': carry_plan_id})
        payload = {
            'base_pool_id': pool_external_id,
            'parent_pool_id': pool_external_id,
            'allocations': [a.model_dump() for a in allocations]
        }
        return self.client.post(
            url,
            data=payload,
            format='json',
            **self.get_headers()
        )