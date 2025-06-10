/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent, useMemo, useState } from 'react'
import {
	Field,
	FieldProps,
	Form,
	Formik,
	FormikHelpers,
	FormikProps,
} from 'formik'
import API from '../../../../api/marketplaceApi'
import {
	AML_FLOW_SLUGS,
	AML_KYC_ENTITIES_WORKFLOW,
	AML_SLUG_SELECTION_ID,
	STATUS_CODES,
} from '../../constants'
import { FormValues } from '../../interfaces'
import { fetchKYCRecord } from '../../thunks'
import { selectKYCRecord } from '../../selectors'
import { WorkFlow } from '../../../../interfaces/workflows'
import { useAppDispatch, useAppSelector } from '../../../../app/hooks'
import {
	setSelectedWorkflowSlug,
	setWorkflow,
	setRecordUUID,
} from '../../kycSlice'
import {
	getAMLInitialWorkflow,
	getAnswerInputComponent,
	getIndividualFormInitialValues,
	getIsFieldEnabled,
	handleValidation,
	parseCard,
} from '../../utils'
import {
	BigTitle,
	ButtonRow,
	Container,
	FieldContainer,
	FieldInner,
	FormContainer,
	NextButton,
	Title,
} from '../../styles'

interface FirstStepProps {
	externalId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const FirstStep: FunctionComponent<FirstStepProps> = ({ externalId }) => {
	const dispatch = useAppDispatch()
	const [activeStep, setActiveStep] = useState(0)
	const { fundWorkflows, applicationRecord } = useAppSelector(selectKYCRecord)
	const workflow = useMemo(getAMLInitialWorkflow(), [])
	const [currentWorkflow, setCurrentWorkflow] = useState<WorkFlow>(workflow)

	const card = useMemo(
		() => currentWorkflow.cards[activeStep],
		[activeStep, currentWorkflow.cards],
	)
	const { schema, title } = parseCard(card)

	const onValidate = (values: FormValues) => handleValidation(values, schema)

	const initialValues = useMemo(
		() => getIndividualFormInitialValues(card?.schema ?? []),
		[card?.schema],
	)

	const onSubmit = async (values: any, _: FormikHelpers<FormValues>) => {
		const selectedWfSlug = values[AML_SLUG_SELECTION_ID]
		const wf =
			fundWorkflows.find(wf => wf.slug === selectedWfSlug) ||
			fundWorkflows.find(wf => wf.slug.startsWith(selectedWfSlug))
		let kycRecord
		switch (selectedWfSlug) {
			case AML_FLOW_SLUGS.INDIVIDUAL:
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				kycRecord = await API.createKYCRecord(
					wf!.slug,
					STATUS_CODES.CREATED,
					{},
				)
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				API.updateAppRecord(applicationRecord!.uuid, {
					kyc_record: { uuid: kycRecord.uuid },
				})
				dispatch(setRecordUUID(kycRecord.uuid))
				dispatch(fetchKYCRecord(kycRecord.uuid))
				dispatch(setSelectedWorkflowSlug(selectedWfSlug))
				dispatch(setWorkflow(wf))
				break
			case AML_FLOW_SLUGS.ENTITY_SELECTION:
				// eslint-disable-next-line no-case-declarations
				const entitiesWf = AML_KYC_ENTITIES_WORKFLOW()
				setCurrentWorkflow(entitiesWf)
				setActiveStep(0)
				break
			case AML_FLOW_SLUGS.PRIVATE_COMPANY:
				if (wf) {
					kycRecord = await API.createKYCEntityRecord(wf!.slug, {
						entity_name: values.entity_name,
					})
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					API.updateAppRecord(applicationRecord!.uuid, {
						kyc_record: { uuid: kycRecord.uuid },
					})
					dispatch(setRecordUUID(kycRecord.uuid))
					dispatch(fetchKYCRecord(kycRecord.uuid))
					dispatch(setWorkflow(wf))
				}
				break
			case AML_FLOW_SLUGS.LIMITED_PARTNERSHIP:
				// eslint-disable-next-line no-case-declarations
				const { entity_name } = values
				kycRecord = await API.createKYCEntityRecord(wf!.slug, {
					entity_name,
				})
				API.updateAppRecord(applicationRecord!.uuid, {
					kyc_record: { uuid: kycRecord.uuid },
				})
				dispatch(setRecordUUID(kycRecord.uuid))
				dispatch(fetchKYCRecord(kycRecord.uuid))
				dispatch(setWorkflow(wf))
				break
			case AML_FLOW_SLUGS.TRUST:
				kycRecord = await API.createKYCEntityRecord(wf!.slug, {
					entity_name: values.entity_name,
				})
				API.updateAppRecord(applicationRecord!.uuid, {
					kyc_record: { uuid: kycRecord.uuid },
				})
				dispatch(setRecordUUID(kycRecord.uuid))
				dispatch(fetchKYCRecord(kycRecord.uuid))
				dispatch(setWorkflow(wf))
				break
			default:
				dispatch(setSelectedWorkflowSlug(selectedWfSlug))
				break
		}
	}

	if (!card) return <Container>No card found.</Container>

	return (
		<Container>
			<BigTitle>{workflow.name}</BigTitle>
			<Formik
				onSubmit={onSubmit}
				initialValues={initialValues}
				validate={onValidate}
				validateOnMount
				enableReinitialize
			>
				{(formikProps: FormikProps<any>) => (
					<FormContainer>
						<Form>
							<Title>{title}</Title>
							{schema.map(question => {
								const isFieldEnabled = getIsFieldEnabled(
									formikProps.values,
									question.field_dependencies,
								)
								if (!isFieldEnabled) return null
								const AnswerInput =
									getAnswerInputComponent(question)

								return (
									<Field key={question.id}>
										{(_: FieldProps) => (
											<FieldContainer>
												<FieldInner>
													<AnswerInput
														question={question}
													/>
												</FieldInner>
											</FieldContainer>
										)}
									</Field>
								)
							})}
						</Form>
						<br />
						<ButtonRow>
							<NextButton
								onClick={formikProps.submitForm}
								disabled={
									Object.values(formikProps.errors).filter(
										p => p,
									).length > 0 || formikProps.isSubmitting
								}
							>
								Next
							</NextButton>
						</ButtonRow>
					</FormContainer>
				)}
			</Formik>
		</Container>
	)
}

export default FirstStep
