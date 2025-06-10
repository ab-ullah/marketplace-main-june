import * as Yup from "yup";
import {ISelectOption} from "../../../../../interfaces/form";

export const INITIAL_VALUES = {
  "file_data": null,
  "field_id": null,
  "id_issuing_country": null,
  "id_document_type": null,
  "id_expiration_date": null,
  "number_of_id": '',
}

export const ID_DOC_IMAGE_VALUE = 'id_doc_image'


export const PASSPORT_TYPE_DOC = 1
export const DRIVERS_LICENSE_DOC = 2
export const NATIONAL_ID_CARD_DOC = 4
export const OTHER_DOC = 5


export const ID_TYPE_OPTIONS = [
  {value: PASSPORT_TYPE_DOC, label: 'Passport'},
  {value: DRIVERS_LICENSE_DOC, label: 'Driver\'s license'},
  {value: NATIONAL_ID_CARD_DOC, label: 'National ID card'},
  {value: OTHER_DOC, label: 'Other'},
]

export const DEFAULT_ID_TYPE_OPTIONS = [
  {value: PASSPORT_TYPE_DOC, label: 'Passport'},
  {value: NATIONAL_ID_CARD_DOC, label: 'National ID card'},
  {value: OTHER_DOC, label: 'Other'},
]

export const EXPIRATION_DOCUMENT_TYPES = [PASSPORT_TYPE_DOC, DRIVERS_LICENSE_DOC]

export const showExpirationDate = (id_document_type: number | null) => {

  return id_document_type && EXPIRATION_DOCUMENT_TYPES.includes(id_document_type)
}


export const VALIDATION_SCHEMA = Yup.object({
  "field_id": Yup.object().shape({
    label: Yup.string().required("Required"),
    value: Yup.string().required("Required"),
  }).nullable().required(),
  "id_issuing_country": Yup.number().when(
    ["field_id"], {
      is: (field_id: ISelectOption) => field_id.value === ID_DOC_IMAGE_VALUE,
      then: Yup.number().required('Please select Id country'),
      otherwise: Yup.number().nullable(true)
    }
  ),
  "id_document_type": Yup.number().when(
    ["field_id"], {
      is: (field_id: ISelectOption) => field_id.value === ID_DOC_IMAGE_VALUE,
      then: Yup.number().required('Please select Id Document Type'),
      otherwise: Yup.number().nullable(true)
    }
  ),
  "number_of_id": Yup.string().when(
    ["field_id"], {
      is: (field_id: ISelectOption) => field_id.value === ID_DOC_IMAGE_VALUE,
      then: Yup.string().required('Please Add Id number'),
      otherwise: Yup.string().nullable(true)
    }
  ),
  "id_expiration_date": Yup.date().when(
    ["field_id", "id_document_type"], {
      is: (field_id: ISelectOption, id_document_type: number | null) => {
        return field_id.value === ID_DOC_IMAGE_VALUE && id_document_type && showExpirationDate(id_document_type)
      },
      then: Yup.date().typeError('Please select a correct date').required('Please Add expiration date'),
      otherwise: Yup.date().nullable(true)
    }
  ),

});