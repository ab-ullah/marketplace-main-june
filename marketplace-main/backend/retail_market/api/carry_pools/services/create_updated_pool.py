from rest_framework.exceptions import ValidationError
from slugify import slugify

from api.admin_users.models import AdminUser
from api.carry_pools.models import CarryPlan, CarryPool
from api.libs.utils.nanoid_generator import generate_nanoid


class CreateUpdatedPool:
    def __init__(self,
                 admin_user: AdminUser,
                 base_pool_id: str,
                 parent_pool_id: str,
                 pool_payload: any
                 ):
        self.parent_pool_id = parent_pool_id
        self.base_pool_id = base_pool_id
        self.pool_payload = pool_payload
        self.admin_user = admin_user
        self.company = self.admin_user.company
        self.is_update = bool(pool_payload.get('external_id'))

    @staticmethod
    def format_pool_payload(payload):
        payload['slug'] = slugify(payload['name'])
        if 'external_id' not in payload:
            payload['external_id'] = generate_nanoid()

        return payload

    @staticmethod
    def insert_update_node_in_pool(pool, parent_id, payload):
        is_update = bool(payload.get('external_id'))
        id_to_match = payload['external_id'] if is_update else parent_id
        for sub_pool in pool.get('pools', []):
            if sub_pool['external_id'] == id_to_match:
                if not is_update:
                    sub_pool['pools'] = [
                        *sub_pool.get('pools', []),
                        CreateUpdatedPool.format_pool_payload(payload=payload)
                    ]
                else:
                    for field, value in payload.items():
                        sub_pool[field] = value
                return

        for sub_pool in pool.get('pools', []):
            CreateUpdatedPool.insert_update_node_in_pool(
                pool=sub_pool,
                parent_id=parent_id,
                payload=payload
            )

    @staticmethod
    def get_carry_pool(pool_id, company):
        return CarryPool.objects.filter(
            external_id=pool_id,
            company_id=company.id
        ).latest(
            'created_at'
        )

    @staticmethod
    def validate_pool(pool):
        allowed_bps = pool['bps']
        used_bps = 0
        for sub_pool in pool.get('pools', []):
            used_bps += sub_pool['bps']
        if used_bps > allowed_bps:
            raise ValidationError('A pool cannot use more bps than its parent pool')

        for sub_pool in pool.get('pools', []):
            CreateUpdatedPool.validate_pool(pool=sub_pool)

    def process(self):
        pool_payload = self.pool_payload

        if not self.base_pool_id:
            if self.is_update:
                CarryPool.objects.filter(
                    external_id=pool_payload['external_id']
                ).update(**pool_payload)
            else:
                carry_plan = CarryPlan.objects.create(
                    company=self.admin_user.company,
                    name=pool_payload.get('name')
                )
                return CarryPool.objects.create(
                    external_id=generate_nanoid(),
                    pools=[],
                    carry_plan=carry_plan,
                    created_by=self.admin_user,
                    company=self.admin_user.company,
                    **self.pool_payload
                )

        base_pool_id = self.base_pool_id

        carry_pool = self.get_carry_pool(
            pool_id=base_pool_id,
            company=self.company
        )
        if self.base_pool_id == self.parent_pool_id and not self.is_update:
            carry_pool.pools = [*carry_pool.pools, {**self.pool_payload, 'external_id': generate_nanoid()}]
        else:
            self.insert_update_node_in_pool(
                pool={
                    'pools': carry_pool.pools
                },
                payload=self.pool_payload,
                parent_id=self.parent_pool_id
            )

        validation_pool = {
            'pools': carry_pool.pools,
            'bps': carry_pool.bps
        }
        self.validate_pool(pool=validation_pool)
        return CarryPool.objects.create(
            external_id=carry_pool.external_id,
            pools=carry_pool.pools,
            created_by=self.admin_user,
            name=carry_pool.name,
            bps=carry_pool.bps,
            allocations=carry_pool.allocations,
            carry_plan=carry_pool.carry_plan,
            company=carry_pool.company
        )
