import { useEffect, useCallback, FunctionComponent } from 'react';
import { useFormikContext } from 'formik';
import debounce from 'lodash/debounce';

interface IAutoSave {
  debounceMs?: number;
}

const AutoSave:FunctionComponent<IAutoSave> = ({ debounceMs }) => {
  const formik = useFormikContext();

  const debouncedSubmit = useCallback(
    debounce(formik.submitForm, debounceMs),
    [formik.submitForm, debounceMs],
  );

  useEffect(() => {
    formik.setSubmitting(true);
    debouncedSubmit();
  }, [debouncedSubmit, formik.values]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

AutoSave.defaultProps = {
  debounceMs: 1000
}

export default AutoSave;
