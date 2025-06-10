import { useEffect, useCallback, FunctionComponent } from 'react';
import { useFormikContext } from 'formik';
import debounce from 'lodash/debounce';

interface IFormikAutoSave {
  debounceMs?: number;
}

const FormikAutoSave: FunctionComponent<IFormikAutoSave> = ({ debounceMs }) => {
  const formik = useFormikContext();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSubmit = useCallback(
    debounce(() => {
      if (formik.isValid) {
        console.log('AUTO SAVE');
        formik.submitForm();
      } else {
        console.log('Form is invalid, skipping auto-save');
      }
    }, debounceMs),
    [formik.isValid, formik.submitForm, debounceMs]
  );

  useEffect(() => {
    if (formik.dirty) { // Only save when there are changes
      debouncedSubmit();
    }
  }, [debouncedSubmit, formik.values]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

FormikAutoSave.defaultProps = {
  debounceMs: 1000,
};

export default FormikAutoSave;
