import { useEffect, useState } from 'react'
import { AnswerTypes } from '../../interfaces/workflows';
import { useField as useFormikField } from 'formik';

export const useField = (name: string, type: keyof AnswerTypes) => {
    const [field, meta, helpers] = useFormikField(name);
    const [hasBeenTouched, setHasBeenTouched] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleBlur = (e: any) => {
        hasBeenTouched && helpers.setTouched(true);
        isFocused && setIsFocused(false);
        field.onBlur && field.onBlur(e);
    }

    const handleFocus = () => {
        !hasBeenTouched && setHasBeenTouched(true)
        !isFocused && setIsFocused(true);
    }

    useEffect(() => {
        return () => {
            if (type === 'date') {
                helpers.setValue(null);
            } else {
                helpers.setValue('');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { field, meta, helpers, handleBlur, handleFocus, isFocused, hasBeenTouched }
}