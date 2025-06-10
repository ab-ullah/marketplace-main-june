from api.tax_records.data.W8_BEN_E_data import W8_BEN_E
from api.tax_records.data.W_8BEN_fields import W_8BEN
from api.tax_records.data.W_8ECI_fields import W_8ECI
from api.tax_records.data.W_8IMY_fields import W_8IMY
from api.tax_records.data.W_9_fields import W_9
from api.tax_records.data.global_entity_sc_fields import GLOBAL_ENTITY_SC
from api.tax_records.data.global_individual_sc_fields import GLOBAL_INDIVIDUAL_SC

TAX_FORM_DATA = {
    "W-9": W_9,
    "Global-Individual-SC": GLOBAL_INDIVIDUAL_SC,
    "Global-Entity-SC": GLOBAL_ENTITY_SC,
    "W-8IMY": W_8IMY,
    "W-8BEN-E": W8_BEN_E,
    "W-8BEN": W_8BEN,
    "W-8ECI": W_8ECI
}

TEXT_FIELD_STYLE = {'height': '12', 'font_size': 'Size7'}