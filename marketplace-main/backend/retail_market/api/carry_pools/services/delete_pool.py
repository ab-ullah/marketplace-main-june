from api.admin_users.models import AdminUser
from api.carry_pools.models import CarryPool


class DeletePool:
    def __init__(self,
                 admin_user: AdminUser,
                 base_pool_id: str,
                 pool_id: str,
                 ):
        self.admin_user = admin_user
        self.company = self.admin_user.company
        self.base_pool_id = base_pool_id
        self.pool_id = pool_id

    def remove_from_pools(self, pools):
        if any(sub_pool['external_id'] == self.pool_id for sub_pool in pools):
            updated_pools = filter(lambda sub_pool: sub_pool['external_id'] != self.pool_id, pools)
            return {'found': True, 'pools': list(updated_pools)}
        else:
            return {'found': False}

    def delete_from_pool(self, pool):
        pool_found = self.remove_from_pools(pool.get('pools'))
        if pool_found['found']:
            pool['pools'] = pool_found['pools']
        else:
            for sub_pool in pool.get('pools', []):
                self.delete_from_pool(
                    pool=sub_pool
                )

    def process(self):
        base_pool = CarryPool.objects.filter(
            external_id=self.base_pool_id,
            company=self.company,
        ).latest('created_at')

        if self.base_pool_id == self.pool_id:
            CarryPool.objects.filter(
                company=self.company,
                external_id=self.pool_id
            ).update(deleted=True)
            return

        if base_pool.pools:
            pool_found = self.remove_from_pools(pools=base_pool.pools)
            if pool_found['found']:
                base_pool.pools = pool_found['pools']
            else:
                for pool in base_pool.pools:
                    self.delete_from_pool(pool=pool)

        return CarryPool.objects.create(
            external_id=base_pool.external_id,
            pools=base_pool.pools,
            created_by=self.admin_user,
            name=base_pool.name,
            bps=base_pool.bps,
            carry_plan=base_pool.carry_plan,
            company=base_pool.company
        )
