/* eslint-disable consistent-return */
/* eslint-disable no-return-await */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
	FunctionComponent,
	useEffect,
	useMemo,
	useReducer,
	useState,
} from 'react'
import get from 'lodash/get'
import first from 'lodash/first'
import { Navigate, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
// import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { PageWrapper } from 'components/Page'
import {
	Field,
	FieldProps,
	Form,
	Formik,
	FormikHelpers,
	FormikProps,
} from 'formik'
import CustomButton from 'components/Button/ThemeButton'
// import Button from 'react-bootstrap/Button'
// import { CircularProgress } from '@material-ui/core'
import {
	useFetchModulePositionQuery,
	useGetFundDetailsQuery,
	useUpdateModulePositionMutation,
} from 'api/rtkQuery/fundsApi'
import { hasOnBoardingPermission } from 'components/FundReview/onboardingPermission'
import API from '../../api/marketplaceApi'
import {
	INVESTOR_URL_PREFIX,
	PARTICIPANT_FORMS_INITIAL_STATE,
	STATUS_CODES,
} from './constants'
import {
	createFirstParticipant,
	fetchInitialRecord,
	fetchKYCRecord,
	fetchKYCDocuments,
	fetchKYCParticipantsDocuments,
	fetchWorkflows,
} from './thunks'
import { selectKYCRecord } from './selectors'
import AutoSave from './components/AutoSave'
import FirstStep from './components/FirstStep'
import { Card, Schema, WorkflowAnswerPayload } from '../../interfaces/workflows'
import { FormValues, Params, RecordDocument } from './interfaces'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { KYC_RECORD } from '../../constants/commentModules'
// TODO add FUND API RTK query here
import {
	handleValidation,
	getAnswerInputComponent,
	getDocumentFieldsList,
	onFormUpdateError,
	parseCard,
	getIndividualFormInitialValues,
	getIsFieldEnabled,
	participantFormStatusReducer,
} from './utils'
import {
	AddAnotherButton,
	// BackButton,
	BigTitle,
	ButtonRow,
	Container,
	EligibilityErrorWrapper,
	FormContainer,
	// NextButton,
	ParticipantDivider,
	Title,
} from './styles'
import { resetToDefault } from './kycSlice'
// import Logo from "../../components/Logo";
import CardContainer from './components/CardContainer'
import BackToApplication from 'components/BackToApplication'
import { ArrowBack, ArrowForward } from '@material-ui/icons'
import { logMixPanelEvent } from 'utils/mixpanel'

const AMLKYCPage: FunctionComponent = () => {
	const dispatch = useAppDispatch()
	const {
		answers,
		kycRecordId,
		kycParticipantIds,
		kycRecordParticipants,
		isFetching,
		didFetch,
		fundWorkflows,
		recordUUID,
		selectedWorkflowSlug,
		status,
		workflow,
	} = useAppSelector(selectKYCRecord)
	// @ts-ignore
	const { externalId, company } = useParams<Params>()
	const [initialValues, setInitialValues] = useState<FormValues>({})
	const { data: fundDetails } = useGetFundDetailsQuery(externalId)
	const [updateKycPosition] = useUpdateModulePositionMutation()
	const { data: kycPosition } = useFetchModulePositionQuery(externalId, {
		skip: !externalId,
	})
	const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(false);
	const [card, setCard] = useState<Card>()
	const [currentStep, setCurrentStep] = useState<number>(0)
	const [isEligibile, setIsEligible] = useState<boolean>(true)
	const [participantForms, dispatchParticipantForms] = useReducer(
		participantFormStatusReducer,
		PARTICIPANT_FORMS_INITIAL_STATE,
	)

	const onSubmit = async (
		values: FormValues,
		{ setSubmitting, setFieldError }: FormikHelpers<FormValues>,
	) => {
		if (kycRecordId === null) return
		// if there are documents to upload, start uploading them first
		const documentFields = getDocumentFieldsList(values, workflow!)
		const documentsUploading = documentFields.reduce((acc, field) => {
			if (!values[field]) return acc
			const files = values[field] as unknown as RecordDocument
			files.pendingUploads.forEach(file => {
				const formData = new FormData()
				formData.append('file_data', file)
				formData.append('field_id', field)
				formData.append('record_id', kycRecordId.toString())
				acc.push(API.uploadDocumentToKYCRecord(kycRecordId, formData))
			})
			return acc
		}, [] as Promise<any>[])

		const nonDocumentFields = Object.entries(values).reduce(
			(acc, [key, value]) => {
				if (
					!documentFields.includes(key) &&
					initialValues[key] !== value
				) {
					acc[key] = value
				}
				return acc
			},
			{} as FormValues,
		)

		try {
			if (Object.keys(nonDocumentFields).length > 0) {
				await API.updateKYCRecord(
					workflow!.slug,
					kycRecordId,
					nonDocumentFields,
				)
				dispatch(fetchKYCRecord(recordUUID!))
				console.log('form data is ', values)
			}
			if (documentsUploading.length > 0) {
				// TODO: handle document upload errors
				await Promise.allSettled(documentsUploading)
				dispatch(fetchKYCDocuments(kycRecordId))
			}
		} catch (e) {
			const error = e as AxiosError
			if (error.response?.data && error.code === '400') {
				// @ts-ignore
				onFormUpdateError(error.response.data, setFieldError)
			} else {
				console.error('Unexpected error', e)
			}
		} finally {
			setSubmitting(false)
			logMixPanelEvent(`AML/KYC ${get(card, 'name', '')} submitted`, get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
		}
	}

	const submitParticipantForm = async (
		values: FormValues,
		{ setSubmitting, setFieldError }: FormikHelpers<FormValues>,
		participantId: number,
		participantFormInitialValues: FormValues,
	) => {
		if (kycRecordId === null) return
		const pendingUploads = getDocumentFieldsList(values, workflow!)
		const documentsUploading = pendingUploads.reduce((acc, field) => {
			const files = values[field] as unknown as RecordDocument
			files.pendingUploads.forEach(file => {
				const formData = new FormData()
				formData.append('file_data', file)
				formData.append('field_id', field)
				formData.append('record_id', participantId.toString())
				acc.push(
					API.uploadKYCParticipantDocument(
						workflow!.slug,
						kycRecordId,
						participantId,
						formData,
					),
				)
			})
			return acc
		}, [] as Promise<any>[])

		const documentFields = getDocumentFieldsList(values, workflow!)
		const nonDocumentFields = Object.entries(values).reduce(
			(acc, [key, value]) => {
				if (
					!documentFields.includes(key) &&
					participantFormInitialValues[key] !== value
				) {
					acc[key] = value
				}
				return acc
			},
			{} as FormValues,
		)

		try {
			if (Object.keys(nonDocumentFields).length > 0) {
				await API.updateParticipantRecord(
					workflow!.slug,
					kycRecordId,
					participantId,
					nonDocumentFields,
				)
				dispatch(fetchKYCRecord(recordUUID!))
			}
			if (documentsUploading.length > 0) {
				await Promise.allSettled(documentsUploading)
				dispatch(fetchKYCParticipantsDocuments(participantId))
			}
		} catch (e) {
			const error = e as AxiosError
			if (error.response?.data && error.response.status === 400) {
				// @ts-ignore
				onFormUpdateError(error.response.data, setFieldError)
			} else {
				console.error('Unexpected error', e)
			}
		} finally {
			setSubmitting(false)
			logMixPanelEvent(`AML/KYC participant form submitted`, get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
		}
	}

	const submitForReview = async ({
		values,
		setFieldError,
		setSubmitting,
	}: FormikProps<FormValues>) => {
		if (kycRecordId === null) return
		try {
			setSubmitting(true)
			const valuesToExclude = getDocumentFieldsList(values, workflow!)
			const answersToExclude = getDocumentFieldsList(answers!, workflow!)
			const payload: WorkflowAnswerPayload = {}
			Object.keys(answers!).forEach(key => {
				if (answersToExclude.indexOf(key) === -1) {
					payload[key] = answers![key]
				}
			})
			Object.keys(values).forEach(key => {
				if (valuesToExclude.indexOf(key) === -1) {
					payload[key] = values[key]
				}
			})
			payload.status = `${STATUS_CODES.SUBMITTED.id}`
			await API.updateKYCRecord(workflow!.slug, kycRecordId, payload)
			externalId && (await API.reviewKYCRecord(externalId, kycRecordId))
			dispatch(fetchKYCRecord(recordUUID!))
			goToNextStep()
		} catch (e) {
			const error = e as AxiosError
			if (error.response?.data && error.code === '400') {
				// @ts-ignore
				onFormUpdateError(error.response.data, setFieldError)
			} else {
				console.error('Unexpected error', e)
			}
		} finally {
			setSubmitting(false)
		}
	}

	const addAnother = async () => {
		if (workflow === null || kycRecordId === null || !repeteable)
			return console.warn('Unable to add another record')
		try {
			await API.createKYCParticipantRecord(workflow!.slug, kycRecordId!)
			dispatch(fetchKYCRecord(recordUUID!))
		} catch (e) {
			console.error(e)
		}
	}

	const markParticipantsAsReady = async () => {
		const requests: Promise<any>[] = []
		kycParticipantIds?.forEach((recordId: number) => {
			requests.push(
				API.updateKYCParticipantStatus(
					workflow!.slug,
					kycRecordId!,
					recordId,
					STATUS_CODES.SUBMITTED,
				),
			)
		})
		return await Promise.all(requests)
	}

	const previousStepAvailable = useMemo(() => {
		if (workflow && workflow?.cards)
			return (
				currentStep !== 0 &&
				workflow!.cards.some(
					(card, i) =>
						i < currentStep &&
						getIsFieldEnabled(
							answers ?? {},
							card?.card_dependencies,
						),
				)
			)
		return false
	}, [currentStep, workflow, answers])

	const goToNextStep = () =>
		setCurrentStep(current => {
			for (let i = current + 1; i < workflow!.cards.length; i++) {
				if (
					getIsFieldEnabled(
						answers!,
						workflow!.cards[i].card_dependencies,
					)
				) {
					return i
				}
			}
			return workflow!.cards.length + 1
		})

	useEffect(() => {
		updateKycPosition({ moduleId: KYC_RECORD, externalId, currentStep })
	}, [currentStep])

	useEffect(() => {
		const positionDetails = first(kycPosition)
		const position = get(positionDetails, 'last_position')
		const module = get(positionDetails, 'module')
		if (position && module === KYC_RECORD) {
			console.log({ position: Number(position) })
			setCurrentStep(Number(position))
		}
	}, [kycPosition])

	const goToPreviousStep = () =>
		setCurrentStep(current => {
			for (let i = current - 1; i >= 0; i--) {
				if (
					getIsFieldEnabled(
						answers!,
						workflow!.cards[i].card_dependencies,
					)
				) {
					return i
				}
			}
			return workflow!.cards.findIndex(card =>
				getIsFieldEnabled(answers!, card.card_dependencies),
			)
		})

	const onValidate = (values: FormValues) => handleValidation(values, schema)

	const { schema, repeteable, title } = useMemo(() => {
		if (card !== undefined) return parseCard(card)
		return { schema: [] as Schema, repeteable: false, title: '' }
	}, [card])

	useEffect(
		() => () => {
			dispatch(resetToDefault())
		},
		[],
	)

	useEffect(() => {
		externalId && dispatch(fetchWorkflows(externalId))
	}, [dispatch, externalId])

	useEffect(() => {
		if (workflow?.cards) {
			const card = workflow.cards[currentStep]
			setCard(card)
		}
	}, [currentStep, workflow?.cards])

	useEffect(() => {
		if (isFetching.firstParticipant) return
		if (
			!workflow?.slug ||
			kycRecordId === null ||
			kycParticipantIds === null
		)
			return
		if (
			repeteable &&
			kycParticipantIds.length === 0 &&
			didFetch.kycRecord
		) {
			dispatch(createFirstParticipant())
		}
	}, [
		dispatch,
		repeteable,
		workflow?.slug,
		kycParticipantIds,
		kycRecordId,
		didFetch.kycRecord,
		isFetching.firstParticipant,
	])

	useEffect(() => {
		if (card && answers) {
			const { initialValues } = parseCard(card, answers)
			setInitialValues(initialValues)
		}
	}, [card, answers])

	useEffect(() => {
		if (typeof kycRecordId === 'number') {
			dispatch(fetchKYCDocuments(kycRecordId))
			// dispatch(fetchComments(kycRecordId));
		}
	}, [dispatch, kycRecordId])

	useEffect(() => {
		if (!didFetch.participantDocuments && kycParticipantIds !== null) {
			kycParticipantIds.forEach(participantId => {
				dispatch(fetchKYCParticipantsDocuments(participantId))
			})
		}
	}, [dispatch, didFetch.participantDocuments, kycParticipantIds])

	useEffect(() => {
		if (didFetch.fundWorkflows && externalId)
			dispatch(fetchInitialRecord(externalId))
	}, [dispatch, didFetch.fundWorkflows, externalId])


	useEffect(()=>{
		setTimeout(()=>window.scrollTo(0,0),400)
	},[card])

	if (workflow && workflow.cards.length === 0)
		return <PageWrapper><Container>This workflow contains no cards.</Container> </PageWrapper> 
	// @ts-ignore
	if (
		didFetch.fundWorkflows &&
		!workflow &&
		!selectedWorkflowSlug &&
		didFetch.initialRecord &&
		!kycRecordId
	)
		return (
			<PageWrapper>
				<FirstStep externalId={externalId as string} />
			</PageWrapper>
		)
	if (didFetch.fundWorkflows && fundWorkflows.length === 0)
		return (
			<PageWrapper>
				<Container>No workflows are available.</Container>
			</PageWrapper>
		)
	if (didFetch.fundWorkflows && !workflow && selectedWorkflowSlug)
		return (
			<PageWrapper>
				<Container>
					No workflow matching {selectedWorkflowSlug} could be found.
				</Container>
			</PageWrapper>
		)
	if (!didFetch.fundWorkflows && !didFetch.initialRecord)
		return (
			<PageWrapper>
				<Container>Fetching available workflows...</Container>
			</PageWrapper>
		)
	if (didFetch.fundWorkflows && !workflow)
		return (
			<PageWrapper>
				<Container>
					Selecting workflow {selectedWorkflowSlug}...
				</Container>
			</PageWrapper>
		)
	if (!workflow || Object.keys(initialValues).length === 0)
		return (
			<PageWrapper>
				<Container>Loading...</Container>
			</PageWrapper>
		)
	// @ts-ignore
	if (!card || !answers) {
		if (fundDetails?.skip_tax) return <Navigate to={`/${company}/funds/${externalId}/bank_details/`} />
		return <Navigate to={`/${company}/funds/${externalId}/tax/`} />
	}

	if (!isEligibile)
		return (
			<PageWrapper>
				<Container>
					<BigTitle>
						{/* <Logo size="md" suffixText={fundDetails?.name} /> */}
						KYC/AML
					</BigTitle>
					<EligibilityErrorWrapper>
						<CustomButton
							// variant='outline-primary btn-back'
							// className='mb-2'
							variant='outlined'
							size='sm'
							onClick={() => {
								setIsEligible(true)
								goToPreviousStep()
							}}
						>
							Back
						</CustomButton>
						<h4 className='heading'>Not Eligible</h4>
						<p>
							Unfortunately you are not eligible to invest in this
							opportunity at this time
						</p>
					</EligibilityErrorWrapper>
				</Container>
			</PageWrapper>
		)

	const addAnotherAvailable =
		repeteable &&
		kycParticipantIds !== null &&
		kycRecordParticipants !== null &&
		didFetch.participantDocuments &&
		((kycParticipantIds.length === 1 && !participantForms.disallowSubmit) ||
			kycParticipantIds.length > 1)

	return (
		<PageWrapper>
			<Container>
				<BigTitle>
					{/* <Logo size="md" suffixText={fundDetails?.name} /> */}
					KYC/AML
				</BigTitle>
				<Formik
					initialValues={initialValues}
					validate={repeteable ? undefined : onValidate}
					onSubmit={onSubmit}
					enableReinitialize
					validateOnMount={false}
				>
					{(formikProps: FormikProps<FormValues>) => (
						<FormContainer>
							{autosaveEnabled && <AutoSave />}
							<Form
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '15px',
								}}
							>
								{
								previousStepAvailable && <BackToApplication />
								}
								<Title>{title}</Title>
								{repeteable &&
									(kycParticipantIds === null ||
										kycRecordParticipants === null ||
										(kycParticipantIds !== null &&
											kycRecordParticipants !== null &&
											!didFetch.participantDocuments)) &&
									'Fetching participants..'}
								{repeteable &&
									kycParticipantIds !== null &&
									kycRecordParticipants !== null &&
									didFetch.participantDocuments &&
									kycParticipantIds.map(recordId => (
										<>
											<CardContainer
												key={recordId}
												recordId={recordId}
												schema={schema}
												initialValues={getIndividualFormInitialValues(
													schema,
													kycRecordParticipants[
														recordId
													],
												)}
												onSubmit={(values, helpers) =>
													submitParticipantForm(
														values,
														helpers,
														recordId,
														getIndividualFormInitialValues(
															schema,
															kycRecordParticipants[
																recordId
															],
														),
													)
												}
												isParticipant
												onStatusChange={
													dispatchParticipantForms
												}
											/>
											<ParticipantDivider />
										</>
									))}
								{!repeteable &&
									schema.map(question => {
										const isFieldEnabled =
											getIsFieldEnabled(
												formikProps.values,
												question.field_dependencies,
											)
										if (!isFieldEnabled) return null
										const AnswerInput =
											getAnswerInputComponent(question)

										return (
											<Field key={question.id}>
												{(_: FieldProps) => (
													<AnswerInput key={question.id} question={question} customOnBlur={() => {setAutosaveEnabled(true)}}/>
												)}
											</Field>
										)
									})}
							</Form>
							<br />
							<ButtonRow alightRight={!previousStepAvailable}>
							{previousStepAvailable && (
									<CustomButton
										iconPosition='right'
										variant='outlined'
										size='sm'
										//@ts-ignore
										MuiIcon={ArrowBack}
										onClick={goToPreviousStep}
									>
										Previous Step
									</CustomButton>
								)}
								{addAnotherAvailable && (
									<AddAnotherButton
										onClick={addAnother}
										disabled={
											Object.values(
												formikProps.errors,
											).filter(p => p).length > 0 ||
											formikProps.isSubmitting ||
											formikProps.isValidating ||
											participantForms.disallowSubmit
										}
									>
										Add another
									</AddAnotherButton>
								)}
								<CustomButton
									disabled={
										Object.keys(formikProps.errors).length >
											0 ||
										(repeteable &&
											participantForms.disallowSubmit) ||
										(repeteable &&
											(kycParticipantIds === null ||
												kycParticipantIds.length === 0))
									}
									//@ts-ignore
									MuiIcon={ArrowForward}
									onClick={async () => {
										if (
											currentStep ===
											workflow!.cards.length - 1
										) {
											return submitForReview(formikProps)
										}
										if (
											formikProps.dirty
										) {
											await formikProps.submitForm()
										}
										if (repeteable) {
											await markParticipantsAsReady()
										}
										if (
											formikProps.values
												.economic_beneficiary === 'none'
										) {
											setIsEligible(false)
										} else setIsEligible(true)
										goToNextStep()
									}}
								>
									{/* {formikProps.isSubmitting ? (
										<>
											Next{' '}
											<CircularProgress
												size={12}
												color='primary'
											/>
										</>
									) : (
										'Next'
									)} */}
									Next Step
								</CustomButton>
							</ButtonRow>
						</FormContainer>
					)}
				</Formik>
			</Container>
		</PageWrapper>
	)
}

export default hasOnBoardingPermission(AMLKYCPage)
