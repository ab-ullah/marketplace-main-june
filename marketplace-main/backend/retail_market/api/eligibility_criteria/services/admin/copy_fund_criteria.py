from api.eligibility_criteria.models import FundEligibilityCriteria, CustomSmartBlockField, CustomSmartBlock, \
    CriteriaBlock
from api.eligibility_criteria.services.admin.add_custom_logic_block import CUSTOM_LOGIC_OVERRIDE_POSITION
from api.eligibility_criteria.services.create_eligibility_criteria import CreateEligibilityCriteriaService
from api.funds.models import Fund

CustomSmartBlockFieldFields = ('title', 'marks_as_eligible', 'reviewers_required', 'required_documents')
CustomSmartBlockFields = ('title', 'description', 'is_multiple_selection_enabled', 'created_by')


class CopyFundCriteriaService:
    def __init__(self, source_fund: Fund, dest_fund: Fund):
        self.source_fund = source_fund
        self.dest_fund = dest_fund

    @staticmethod
    def copy_attributes(attrs, source_model, dest_model):
        for attr in attrs:
            value = getattr(source_model, attr)
            setattr(dest_model, attr, value)

    @staticmethod
    def get_region_and_country_codes(eligibility_criteria: FundEligibilityCriteria):
        country_region_codes = []
        for country in eligibility_criteria.criteria_countries.all():
            country_region_codes.append(country.country.iso_code)

        for region in eligibility_criteria.criteria_regions.all():
            country_region_codes.append(f'RG|{region.region.region_code}')

        return country_region_codes

    def copy_custom_smart_block_field(self, custom_smart_block, source_custom_block_field):
        new_field = CustomSmartBlockField(block=custom_smart_block)
        self.copy_attributes(
            attrs=CustomSmartBlockFieldFields,
            source_model=source_custom_block_field,
            dest_model=new_field
        )
        new_field.save()

    def copy_custom_smart_block(self, eligibility_criteria, source_custom_smart_block):
        new_custom_block = CustomSmartBlock(
            fund=self.dest_fund,
            company=self.dest_fund.company,
            eligibility_criteria=eligibility_criteria
        )
        self.copy_attributes(
            attrs=CustomSmartBlockFields,
            source_model=source_custom_smart_block,
            dest_model=new_custom_block
        )
        new_custom_block.save()
        for custom_smart_block_field in source_custom_smart_block.custom_fields.all():
            self.copy_custom_smart_block_field(
                custom_smart_block=new_custom_block,
                source_custom_block_field=custom_smart_block_field
            )
        return new_custom_block

    def copy_criteria_block(self, eligibility_criteria: FundEligibilityCriteria, source_block: CriteriaBlock):
        smart_block = self.copy_custom_smart_block(
            eligibility_criteria=eligibility_criteria,
            source_custom_smart_block=source_block.custom_block
        )
        CriteriaBlock.objects.create(
            custom_block=smart_block,
            criteria=eligibility_criteria,
            position=source_block.position,
            is_custom_block=source_block.is_custom_block,
            is_smart_block=source_block.is_smart_block,
            auto_completed=source_block.auto_completed,
            payload=source_block.payload,

        )

    def copy_criteria(self, source_eligibility_criteria: FundEligibilityCriteria):
        region_country_codes = self.get_region_and_country_codes(eligibility_criteria=source_eligibility_criteria)
        validated_data = {
            "country_region_codes": region_country_codes,
            "is_smart_criteria": True,
            "fund": self.dest_fund,
            "created_by": source_eligibility_criteria.created_by
        }
        new_criteria = CreateEligibilityCriteriaService(
            validated_data=validated_data
        ).create()
        if CriteriaBlock.objects.filter(
            criteria=source_eligibility_criteria,
            is_custom_logic_block=True
        ).exists():
            CriteriaBlock.objects.create(
                criteria=new_criteria,
                position=CUSTOM_LOGIC_OVERRIDE_POSITION,
                is_custom_logic_block=True
            )
        for criteria_block in source_eligibility_criteria.criteria_blocks.filter(
                is_smart_block=True,
                is_custom_block=True
        ):
            self.copy_criteria_block(
                eligibility_criteria=new_criteria,
                source_block=criteria_block
            )

    def process(self):
        for eligibility_criteria in self.source_fund.fund_eligibility_criteria.filter(is_smart_criteria=True):
            self.copy_criteria(source_eligibility_criteria=eligibility_criteria)
