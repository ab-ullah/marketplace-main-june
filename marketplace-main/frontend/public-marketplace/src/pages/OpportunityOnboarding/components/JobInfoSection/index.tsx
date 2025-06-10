import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import { AnyObject, OptionalObjectSchema, TypeOfShape } from 'yup/lib/object'
import { IEligibilityData } from 'interfaces/OpportunityOnboarding'
import Button from 'components/Button/ThemeButton'
import { getCountries, submitJobInfo } from 'services/OpportunityOnboarding'
import { ValueType } from 'components/Input'
import { Section } from '../../styled'
import FieldInput from '../FieldInput'
import { FIELDS, VALIDATION_SCHEMA, INITIAL_VALUES, ONBOARDING_DEFAULTS } from './constants'
import { useGetFundDetailsQuery } from 'api/rtkQuery/fundsApi'
import { logMixPanelEvent } from 'utils/mixpanel'
import { get } from 'lodash';
import { getUserInfo } from 'services/User'
import { ArrowForward } from '@material-ui/icons'

const JobInfoSection = ({
	externalId,
	updateEligibilityFlow,
	selectedAnswer
}: {
	externalId: string
	updateEligibilityFlow: (_res: IEligibilityData) => void
	selectedAnswer:any
}) => {
	const [fields, setFields] = useState(FIELDS)
	const [initial, setInitial] = useState<Record<string, ValueType>>(INITIAL_VALUES)
	const answerObj = selectedAnswer?.response_json
	const {data: fundDetails} = useGetFundDetailsQuery(externalId)

	const [validation] = useState<
		OptionalObjectSchema<
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			Record<string, any>,
			AnyObject,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			TypeOfShape<Record<string, any>>
		>
	>(VALIDATION_SCHEMA)

	const formik = useFormik({
		initialValues: initial,
		validationSchema: validation,
		enableReinitialize: true,
		onSubmit: async _values => {
			const res = await submitJobInfo(externalId, {..._values, ...ONBOARDING_DEFAULTS})
			if (res.success) {
				updateEligibilityFlow(res.data)
				logMixPanelEvent('Onboarding country selector step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
			}
		},
	})

	const handleCountriesOptions = async () => {
		const res = await getCountries(externalId)
		if (res.success) {
			const newOptions = res.data.find(
				(opt: { label: string }) => opt.label === 'Countries',
			).options
			const updatedFields = fields.map(field => {
				if (field.fieldId === 'origin_country') {
					return {
						...field,
						options: newOptions,
					}
				}
				return field
			})
			setFields(updatedFields)
		}
	}

	const handleUserInfo = async () => {
		const res = await getUserInfo()
		if (res.success) {
			const {first_name,last_name}=res.data
			setInitial(prev => ({
				...prev,
				first_name,last_name
			}))
		}
	}

	useEffect(() => {
		handleCountriesOptions()
	}, [])

	useEffect(()=>{
		handleUserInfo()
	},[])

	useEffect(() => {
		const countryField = fields.find((field)=>field.fieldId==='origin_country')
		const hasOptions= countryField?.options && countryField?.options.length>0

		if (answerObj && hasOptions) {
			const { country, vehicle_type } = answerObj

			setInitial(prev => ({
				...prev,
				entity_type: vehicle_type.value || '',
				origin_country: countryField?.options?.find(opt=>opt.value===country.value) || {},
			}))
		}
	}, [answerObj,fields])

	// useEffect(() => {
	// 	setTimeout(() => {
	// 		setInitial(prev => ({ ...prev, jobTitle: 'Dev' }))
	// 	}, 3000)
	// }, [])

	return (
		<>
			<Section>
				{fields.slice(0, 3).map(field => (
					<FieldInput
						key={`${field.fieldId}-fieldInput`}
						field={field}
						value={formik.values}
						setValue={formik.setFieldValue}
						errors={formik.errors}
					/>
				))}
			</Section>
			<Section>
				{fields.slice(3,4).map(field => (
					<FieldInput
						key={`${field.fieldId}-fieldInput`}
						field={field}
						value={formik.values}
						setValue={formik.setFieldValue}
						errors={formik.errors}
					/>
				))}
			</Section>
			<Button
				loading={formik.isSubmitting}
				solo
				position='right'
				onClick={formik.submitForm}
				disabled={!formik.isValid}
			>
				<ArrowForward /> Submit Info
			</Button>
		</>
	)
}

export default JobInfoSection
