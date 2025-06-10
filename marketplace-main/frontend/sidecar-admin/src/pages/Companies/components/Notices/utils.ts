import * as Yup from "yup";
import {UploadType} from "./AddNotices";

export const VALIDATION_SCHEMA = Yup.object({
    'uploadType': Yup.object().shape({
      label: Yup.string().required('Required'),
      value: Yup.string().required('Required'),
    }).required('Select an upload type').nullable(),
    "documentFile": Yup.mixed().required("Select a file"),
    'selectedInvestor': Yup.object().shape({
      label: Yup.string().required('Required'),
      value: Yup.string().required('Required'),
    }).when('uploadType', {
      is: (...fields: any) => {
        const [uploadType] = fields;
        return !([UploadType.COMPENSATION, UploadType.EMPLOYEE, UploadType.ORGANIZATIONAL_CHART].includes(uploadType?.value))
      },
      then: Yup.object().shape({
        label: Yup.string().required('Required'),
        value: Yup.string().required('Required'),
      }).required('Required').nullable(),
      otherwise: Yup.object().shape({
        label: Yup.string().required('Required'),
        value: Yup.string().required('Required'),
      }).notRequired().nullable()
    }),
  });