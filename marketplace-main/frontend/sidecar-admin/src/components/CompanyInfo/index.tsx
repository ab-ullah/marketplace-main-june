import {ChangeEvent, useMemo} from "react";
import {Formik} from "formik";
import * as Yup from "yup";
import API from "../../api/backendApi";
import {
  useGetCompanyInfoQuery,
  useUpdateCompanyInfoMutation,
  useUpdateCompanyProfileMutation
} from "../../api/rtkQuery/companyApi";
import CompanyInfoForm from "./InfoForm";
import AutoSave from "../Autosave";


export const INITIAL_VALUES = {
  logo: "",
  name: "",
  contact_email: "",
}


export const VALIDATION_SCHEMA = Yup.object({
  logo: Yup.string().required("Required"),
  name: Yup.string().required("Required"),
  contact_email: Yup.string().required("Required").nullable(),
});


const CompanyInfo = () => {
  const { data: companyInfo, refetch: refetchInfo } = useGetCompanyInfoQuery({});
  const [updateCompanyProfile] = useUpdateCompanyProfileMutation();
  const [updateCompanyInfo] = useUpdateCompanyInfoMutation();

  const handleChange = async (values: any) => {
    await updateCompanyProfile({ 'contact_email': values.contact_email });
    const companyInfo = await updateCompanyInfo({ 'name': values.name });
    return companyInfo;
  }

  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const formData = new FormData();
    formData.append('logo', e.target.files[0]);
    await API.saveCompanyInfo(formData);
    refetchInfo();
    return true;
  }

  const onSubmit = async (
    values: any,
    { setSubmitting }: any
  ) => {
    setSubmitting(true);
    await handleChange(values);
    setSubmitting(false);
  }
  

  const formData = useMemo(() => {
    if(companyInfo)
    return {
      logo: companyInfo.logo,
      name: companyInfo.name,
      contact_email: companyInfo.company_profile.contact_email,
    }
    return false;
  }, [companyInfo])

  if(!formData) return <></>

  return (
    <Formik
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={onSubmit}
      initialValues={formData}
      enableReinitialize={true}
    >
      {({
        values,
        setFieldValue
      }) => {
        return (
          <>
            <AutoSave />
            <CompanyInfoForm
              values={values}
              setFieldValue={setFieldValue}
              uploadFile={uploadFile}
            />
          </>
        )
      }}
    </Formik>
  )
};

export default CompanyInfo;
