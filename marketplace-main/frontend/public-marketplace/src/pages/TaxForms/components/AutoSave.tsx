import { useEffect, useCallback } from 'react'
import { useFormikContext } from 'formik'
import _ from 'lodash'

// eslint-disable-next-line react/prop-types
const AutoSave = ({ debounceMs = 1000 }) => {
	const formik = useFormikContext()

	const debouncedSubmit = useCallback(
		_.debounce(formik.submitForm, debounceMs),
		[formik.submitForm, debounceMs],
	)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useEffect(() => debouncedSubmit as any, [debouncedSubmit, formik.values])

	return null
}

export default AutoSave
