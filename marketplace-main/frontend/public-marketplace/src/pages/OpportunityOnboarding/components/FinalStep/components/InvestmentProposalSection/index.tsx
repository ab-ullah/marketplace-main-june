import { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { AnyObject, OptionalObjectSchema, TypeOfShape } from 'yup/lib/object'

import Button from 'components/Button/ThemeButton'
import { ValueType } from 'components/Input'
import {
	FIELDS,
	VALIDATION_SCHEMA,
	INITIAL_VALUES,
} from './constants'
import { Left, Right, Cont, ButtonWrapper } from './styled'
import { Section } from '../../../../styled'
import GrossCard from './components/GrossCard'
import FieldInput from '../../../FieldInput'
import { get } from 'lodash'
import { ArrowBack, ArrowForward } from '@material-ui/icons'

interface InvestmentProposalSectionProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handleSubmitInvestment: (_payload: any) => void
	handleBack: () => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	investmentAmount: any
	minimumInvestment: number,
	currency: any,
	offerLeverage: boolean
}

const InvestmentProposalSection = ({
	handleSubmitInvestment,
	handleBack,
	investmentAmount,
	minimumInvestment,
	currency,
	offerLeverage
}: InvestmentProposalSectionProps) => {
	const [initial, setInitial] =
		useState<Record<string, ValueType>>(INITIAL_VALUES)
	const [fields, setFields] = useState(FIELDS)

	const [validation, setValidation] = useState<
		OptionalObjectSchema<
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			Record<string, any>,
			AnyObject,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			TypeOfShape<Record<string, any>>
		>
	>(VALIDATION_SCHEMA)
	const currencyCode = get(currency, 'code', 'USD')
	const currencySymbol = get(currency, 'symbol', '$')

	const formik = useFormik({
		initialValues: initial,
		validationSchema: validation,
		validateOnChange: true,
		enableReinitialize: true,
		onSubmit: async _values => {
			handleSubmitInvestment(_values)
		},
	})

	const { amount, leverage_ratio } = investmentAmount

	useEffect(() => {
		setInitial(prev => ({ ...prev, amount, leverage_ratio }))

		const newFields = FIELDS.map(f => {
			if (f.fieldId === 'amount') {
				return { ...f, hintText: `Min. ${currencySymbol}${minimumInvestment}` }
			}
			return f
		})

		setFields(newFields)

		const newSchema = validation.shape({
			amount: Yup.string().test(
				'min-limit',
				`Enter more than ${currencySymbol}${minimumInvestment}`,
				value =>
					parseFloat((value as string)?.split('.')[0]) >=
					minimumInvestment,
			),
		})
		setValidation(newSchema)
	}, [])
	
	return (
		<>
			{/* <Description>{DESCRIPTION_TEXT}</Description> */}
			<Cont>
				<Left>
					<Section>
						{fields.slice(0, 1).map(field => (
							<FieldInput
								key={`${field.fieldId}-fieldInput`}
								field={{...field, prefix: currencyCode, currency: currencyCode, symbol: currencySymbol}}
								value={formik.values}
								setValue={formik.setFieldValue}
								errors={formik.errors}
							/>
						))}
					</Section>

					{offerLeverage && <Section>
						{fields.slice(1, 2).map(field => (
							<FieldInput
								key={`${field.fieldId}-fieldInput`}
								field={field}
								value={formik.values}
								setValue={formik.setFieldValue}
								errors={formik.errors}
							/>
						))}
					</Section>}
				</Left>
				<Right>
					<GrossCard
						equity={formik.values.amount as string}
						leverage={formik.values.leverage_ratio as number}
						currency={currencyCode}
						offerLeverage={offerLeverage}
					/>
				</Right>
			</Cont>
			<ButtonWrapper>
			<Button
				onClick={handleBack}
				solo
				position='left'
				variant='outlined'
				size='sm'
			>
				Previous Step <ArrowBack />
			</Button>
			<Button
				loading={formik.isSubmitting}
				solo
				position='right'
				onClick={formik.submitForm}
				disabled={!formik.isValid}
			>
				<ArrowForward /> Submit Info
			</Button>
			</ButtonWrapper>
		</>
	)
}

export default InvestmentProposalSection
