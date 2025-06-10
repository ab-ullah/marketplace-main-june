/* eslint-disable no-unused-expressions */
/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react'
import { useField as useFormikField } from 'formik'
import { AnswerTypes } from '../../interfaces/workflows'

export const useField = (name: string, type: keyof AnswerTypes) => {
	const [field, meta, helpers] = useFormikField(name)
	const [hasBeenTouched, setHasBeenTouched] = useState(false)
	const [isFocused, setIsFocused] = useState(false)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleBlur = (e: any) => {
		// eslint-disable-next-line no-unused-expressions
		hasBeenTouched && helpers.setTouched(true)
		isFocused && setIsFocused(false)
		e.target.value !== field.value && field.onBlur && field.onBlur(e)
	}

	const handleFocus = () => {
		!hasBeenTouched && setHasBeenTouched(true)
		!isFocused && setIsFocused(true)
	}

	// eslint-disable-next-line arrow-body-style
	useEffect(() => {
		return () => {
			switch (type) {
				case 'date':
					helpers.setValue(null)
					break
				case 'file_upload':
					break
				default:
					helpers.setValue('')
					break
			}
		}
	}, [])

	return {
		field,
		meta,
		helpers,
		handleBlur,
		handleFocus,
		isFocused,
		hasBeenTouched,
	}
}
