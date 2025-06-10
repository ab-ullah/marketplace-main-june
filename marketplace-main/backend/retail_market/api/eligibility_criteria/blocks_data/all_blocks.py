from api.eligibility_criteria.blocks_data.AU.professional_investor_blocks import AU_PROFESSIONAL_INVESTOR_BLOCKS
from api.eligibility_criteria.blocks_data.AU.sophisticated_investor_blocks import AU_SOPHISTICATED_INVESTOR_BLOCKS
from api.eligibility_criteria.blocks_data.AU.wholesale_client_blocks import AU_WHOLESALE_CLIENT_BLOCKS
from api.eligibility_criteria.blocks_data.CN.legitimate_assets_blocks import CN_LEGITIMATE_ASSETS_BLOCKS
from api.eligibility_criteria.blocks_data.CN.tax_files_blocks import TAX_FILINGS_BLOCKS
from api.eligibility_criteria.blocks_data.JP.eligible_entity_blocks import JP_ELIGIBLE_ENTITY_BLOCKS
from api.eligibility_criteria.blocks_data.KR.filling_acknowledgements_block import KR_FILLING_ACKNOWLEDGEMENTS_BLOCK
from api.eligibility_criteria.blocks_data.US.accredited_investor_blocks import US_ACCREDITED_INVESTOR_BLOCKS
from api.eligibility_criteria.blocks_data.US.qualified_purchaser import US_QUALIFIED_PURCHASER_BLOCKS
from api.eligibility_criteria.blocks_data.any_region_blocks import ANY_REGION_BLOCKS
from api.eligibility_criteria.blocks_data.investor_blocks import INVESTOR_BLOCKS

BLOCK_CONTAINERS = [
    INVESTOR_BLOCKS,
    US_ACCREDITED_INVESTOR_BLOCKS,
    AU_PROFESSIONAL_INVESTOR_BLOCKS,
    AU_SOPHISTICATED_INVESTOR_BLOCKS,
    AU_WHOLESALE_CLIENT_BLOCKS,
    CN_LEGITIMATE_ASSETS_BLOCKS,
    TAX_FILINGS_BLOCKS,
    JP_ELIGIBLE_ENTITY_BLOCKS,
    KR_FILLING_ACKNOWLEDGEMENTS_BLOCK,
    US_QUALIFIED_PURCHASER_BLOCKS
]

ALL_BLOCKS = [
    *BLOCK_CONTAINERS,
    *ANY_REGION_BLOCKS
]
