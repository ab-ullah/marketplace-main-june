import map from "lodash/map";
import * as Yup from "yup";

export const formatCarryPlansOptions = (plans: any[]) => {
  return map(plans, (plan) => {
    const { id, name } = plan;
    return {
      label: name,
      value: id,
    };
  });
};

export const confirmationDescription={
  activate:(docName:string)=>`Activating ${docName} will start showing users this document upon carry allocation or forfeiture. Are you sure you want to activate this document?`,
  deactivate:(docName:string)=>`Deactivating ${docName} will stop showing users this document upon carry allocation or forfeiture. Are you sure you want to deactivate this document?`
}

export const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  document_file: Yup.mixed()
    .required("Document file is required")
    .test("fileType", "Invalid file type", (value) => {
      if (!value) return false; // Ensures a file is provided
      return value instanceof File; // Check if it's a File object
    }),
  document_type: Yup.object()
    .nullable()
    .shape({
      value: Yup.number().required("Value is required"),
    })
    .required("Document type is required"),
});