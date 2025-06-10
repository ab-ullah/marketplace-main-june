import * as Yup from "yup";

export const INITIAL_VALUES = {
  first_name: "",
  last_name: "",
  email: "",
} as Record<string,string>;

export const VALIDATION_SCHEMA = Yup.object({
  first_name: Yup.string().required("Required"),
  last_name: Yup.string().required("Required"),
  email: Yup.string().email().required("Required"),
});

export const FIELDS = [
  {
    title: "First Name",
    key: "first_name",
  },
  {
    title: "Last Name",
    key: "last_name",
  },
  {
    title: "Email",
    key: "email",
  },
];

export const ALERT_MSG ={
  success:'Your invite has been sent',
  danger: 'Something went wrong'
} as Record<string,string>