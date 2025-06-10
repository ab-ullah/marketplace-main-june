/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
import { useEffect, useState } from 'react'
import { useField as useFormikField } from 'formik'
import { AnswerTypes } from '../../interfaces/workflows'

// eslint-disable-next-line import/prefer-default-export
export const useField = (name: string, type: keyof AnswerTypes) => {
	const [field, meta, helpers] = useFormikField(name)
	const [hasBeenTouched, setHasBeenTouched] = useState(false)
	const [isFocused, setIsFocused] = useState(false)

	const handleBlur = (e: any) => {
		hasBeenTouched && helpers.setTouched(true)
		isFocused && setIsFocused(false)
		field.onBlur && field.onBlur(e)
	}

	const handleFocus = () => {
		!hasBeenTouched && setHasBeenTouched(true)
		!isFocused && setIsFocused(true)
	}

	useEffect(
		() => () => {
			if (type === 'date') {
				helpers.setValue(null)
			} else {
				helpers.setValue('')
			}
		},
		[],
	)

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
