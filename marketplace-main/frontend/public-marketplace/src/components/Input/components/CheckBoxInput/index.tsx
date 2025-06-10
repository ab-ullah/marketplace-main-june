/* eslint-disable react/no-array-index-key */
import { useState, ChangeEvent, useEffect } from 'react'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { OptionTypeBase } from 'react-select'

interface CheckBoxInputProps {
	value: Record<string, boolean>
	onChange: (e: Record<string, boolean>) => void
	options: OptionTypeBase[]
	fieldId: string
	disabled: boolean
}

const CheckBoxInput = (props: CheckBoxInputProps) => {
	const { value, onChange, options, fieldId, disabled } = props
	const [state, setState] = useState(value)

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setState({
			...state,
			[event.target.name]: event.target.checked,
		})
	}

	useEffect(() => {
		onChange(state)
	}, [state])
	return (
		<FormGroup>
			{options.map((opt, i) => (
				<FormControlLabel
					sx={{ alignItems: 'flex-start' }}
					key={`key-${fieldId}-${i}`}
					id={`id-${fieldId}-${i}`}
					control={
						<Checkbox
							checked={value?.[opt.value] || false}
							onChange={handleChange}
							name={opt.value}
						/>
					}
					label={opt.label}
					disabled={disabled}
				/>
			))}
		</FormGroup>
	)
}

export default CheckBoxInput
