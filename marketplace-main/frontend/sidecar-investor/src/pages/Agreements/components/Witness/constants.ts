import * as Yup from "yup";

export const INITIAL_VALUES = {
  email: '',
  name: '',
}

export const getValidationSchema = (useEmail: string) => {
  return Yup.object(
    {
      email: Yup.string().email('Invalid email format').required("Required").test(
        'You cannot use your own email as witness',
        'You cannot use your own email as witness',
        val => Boolean(val && val.toLowerCase() !== useEmail.toLowerCase())
      ),
      name: Yup.string().required("Required").test(
        'len', 'Must be atleast 5 characters', val => Boolean(val && val.length >= 5)
      ),
    }
  );
}