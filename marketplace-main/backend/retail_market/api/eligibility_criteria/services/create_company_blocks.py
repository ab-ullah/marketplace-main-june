from copy import deepcopy

from api.companies.models import Company
from api.eligibility_criteria.blocks_data.all_blocks import BLOCK_CONTAINERS
from api.eligibility_criteria.blocks_data.any_region_blocks import ANY_REGION_BLOCKS
from api.eligibility_criteria.models import BlockCategory, Block
from api.geographics.models import Country, Region


class CreateCompanyBlocksService:
    def __init__(self, company: Company):
        self.company = company

    def create_block(self, category, block_data):
        company = self.company
        block = deepcopy(block_data)
        block_id = block['block_id']
        country = None
        region = None
        country_code = block.pop('country_code', None)
        if country_code:
            try:
                country = Country.objects.get(iso_code__iexact=country_code)
            except Country.DoesNotExist:
                pass
        region_code = block.pop('region_code', None)
        if region_code:
            try:
                region = Region.objects.get(region_code=region_code, company=company)
            except Region.DoesNotExist:
                pass

        block.update({
            'country': country,
            'region': region
        })
        Block.objects.update_or_create(
            company=company,
            category=category,
            block_id=block_id,
            defaults=block
        )

    def create(self):
        company = self.company
        investor_category = BlockCategory.objects.filter(
            company=company,
            name__iexact='investor'
        ).first()
        fund_category = BlockCategory.objects.filter(
            company=company,
            name__iexact='fund'
        ).first()

        for block in ANY_REGION_BLOCKS:
            self.create_block(category=fund_category, block_data=block)

        for block_container in BLOCK_CONTAINERS:
            for block in block_container:
                self.create_block(category=fund_category, block_data=block)
                self.create_block(category=investor_category, block_data=block)
