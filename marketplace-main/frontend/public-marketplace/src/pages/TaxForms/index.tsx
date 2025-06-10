/* eslint-disable no-console */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import React, { FunctionComponent, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import map from 'lodash/map'
import filter from 'lodash/filter'
import includes from 'lodash/includes'
import get from 'lodash/get'
import first from 'lodash/first'
import { useNavigate } from 'react-router'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { Link, useParams } from 'react-router-dom'
import size from 'lodash/size'
import Select, { OptionTypeBase } from 'react-select'
import TableContainer from '@material-ui/core/TableContainer'
import Col from 'react-bootstrap/Col'
import Table from '@material-ui/core/Table'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import { Container as BSContainer, Form } from 'react-bootstrap'
import { PageWrapper } from 'components/Page'
import CustomButton from 'components/Button/ThemeButton'
import CustomInput from 'components/Input'
import { ErrorMessage, Formik } from 'formik'
import { hasOnBoardingPermission } from 'components/FundReview/onboardingPermission'
import API from '../../api/marketplaceApi'
import {
	createTaxWorkflow,
	fetchAppRecord,
	fetchGeoSelector,
	fetchTaxDetails,
	fetchTaxDocuments,
	fetchTaxForms,
	updateTaxRecord,
} from './thunks'
import {
	// BackButton,
	BigTitle,
	Container,
	FakeLink,
	FormContainer,
	// NextButton,
	StyledForm,
	TableCellBody,
	TableCellHeader,
	TableHead,
	TaxEndDiv,
	TaxForm,
	Title,
} from './styles'
import { selectAppRecords, selectGeoSelector } from './selectors'
import { useAppDispatch, useAppSelector } from '../../app/hooks'

import { deleteLink, updateLink } from './taxRecordsSlice'
import {
	useFetchModulePositionQuery,
	useGetFundDetailsQuery,
	useUpdateModulePositionMutation,
} from '../../api/rtkQuery/fundsApi'

import {
	ENITY_CERTIFICATION_DOCUMENT_ID,
	FORM_FIELDS_OPTIONS,
	INDIVIDUAL_CERTIFICATION_DOCUMENT_ID,
	Tax_FORM_STEPS,
	VALIDATION_SCHEMA,
} from './Constants'
import NavableLoader from '../../components/NavableLoader'
import { TAX_RECORD } from '../../constants/commentModules'
// import RadioGroup from './components/RadioGroup'
import { selectKYCRecord } from '../KnowYourCustomer/selectors'
import { fetchKYCRecord } from '../KnowYourCustomer/thunks'
import TextInput from './components/TextInput'
import AutoSave from './components/AutoSave'
import { KYC_ENTITY_INVESTORS } from '../KnowYourCustomer/constants'
import 'react-datepicker/dist/react-datepicker.css'
// eslint-disable-next-line import/order
import moment from 'moment'
import { getDateFromString } from '../../utils'
import { logMixPanelEvent } from 'utils/mixpanel'
import { ArrowForward } from '@material-ui/icons'
import { ButtonWrapper } from 'pages/OpportunityOnboarding/components/FinalStep/components/InvestmentProposalSection/styled'
import BackToApplication from 'components/BackToApplication'

type CountryType = OptionTypeBase | null | undefined

const TaxFormsPage: FunctionComponent = () => {
	const dispatch = useAppDispatch()
	const history = useNavigate()
	const {
		taxForms,
		hasFetchedAppRecords,
		taxDocumentsList,
		appRecords,
		taxFormsLinks,
		taxDetails,
	} = useAppSelector(selectAppRecords)
	const { answers } = useAppSelector(selectKYCRecord)
	const { externalId, company } = useParams<any>()
	const [selectedCountry, setSelectedCountry] = useState<CountryType>(null)
	const [isUpdatingDocument, setIsUpdatingDocument] = useState(false)
	const [displayedFormNumber, setDisplayedFormNumber] = useState(
		Tax_FORM_STEPS.COUNTRY_SELECTION as number,
	)
	const [disableRadioButtons, setDisableRadioButtons] = useState(false)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
	const [selectedRadioButton, setSelectedRadioButton] = useState(null)
	const [disableLinks, setDisableLinks] = useState(false)
	const geoSelector = useAppSelector(selectGeoSelector)
	const [updateTaxPosition] = useUpdateModulePositionMutation()
	const { data: taxPosition } = useFetchModulePositionQuery(externalId, {
		skip: !externalId,
	})
	const { data: fundDetails } = useGetFundDetailsQuery(externalId)

	const useStyles = makeStyles({
		table: {
			minWidth: 0,
			boxShadow: '0px 76px 74px rgba(0,0,0,0.75)',
		},
	})

	useEffect(() => {
		if (externalId) {
			dispatch(fetchTaxForms(externalId))
			dispatch(fetchAppRecord(externalId))
			dispatch(fetchGeoSelector(externalId))
			dispatch(createTaxWorkflow(externalId))
		}
	}, [])

	useEffect(() => {
		if (
			hasFetchedAppRecords &&
			appRecords.length > 0 &&
			!appRecords[0].tax_record
		) {
			const createTaxRecord = async () =>
				externalId && API.createTaxRecord(externalId)
			createTaxRecord().then(taxResult => {
				const updateAppRecord = async () =>
					API.updateAppRecord(appRecords[0].uuid, {
						tax_record: { uuid: taxResult.uuid },
					})
				// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
				updateAppRecord().then(result => {
					if (externalId) {
						dispatch(fetchAppRecord(externalId))
						dispatch(fetchTaxDocuments(taxResult.uuid))
					}
				})
			})
		} else if (hasFetchedAppRecords) {
			dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid))
			saveForm()
		}
	}, [dispatch, hasFetchedAppRecords, appRecords, externalId])

	useEffect(() => {
		const urlParams = getUrlParams()
		const envelopeId = urlParams.get('envelope_id')
		if (envelopeId) {
			setDisplayedFormNumber(Tax_FORM_STEPS.DOCUMENTS)
			markDisabled()
		}
	}, [])

	useEffect(() => {
		const [record] = appRecords
		if (record && record?.kyc_record && record?.tax_record) {
			dispatch(fetchKYCRecord(record.kyc_record.uuid))
			dispatch(fetchTaxDetails(record.tax_record.uuid))
		}
	}, [appRecords])

	const getUrlParams = () => {
		const queryString = window.location.search
		return new URLSearchParams(queryString)
	}

	const saveForm = () => {
		const urlParams = getUrlParams()
		const envelopeId = urlParams.get('envelope_id')
		const event = urlParams.get('event')

		if (envelopeId) {
			if (event === 'signing_complete') {
				setIsUpdatingDocument(true)
				saveSignedForm(envelopeId).then(() => {
					dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid))
					setIsUpdatingDocument(false)
				})
			} else {
				dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid))
			}
		}
	}

	const saveSignedForm = async (envelope_id: string) => {
		externalId && (await API.saveSignedForm(externalId, envelope_id))
	}

	const signingUrl = async (envelope_id: string, fund: string) => {
		const { host, protocol } = window.location
		const return_url = encodeURIComponent(
			`${protocol}//${host}/${company}/funds/${fund}/tax?envelope_id=${envelope_id}`,
		)

		const response = await API.getSigningUrl(envelope_id, return_url)
		window.open(response.signing_url, '_self')
		return response
	}

	const markDisabled = () => {
		// @ts-ignore
		for (const [key, value] of Object.entries(taxFormsLinks)) {
			// @ts-ignore
			if (value.checked === true) {
				// @ts-ignore
				value.inputType === 'radio' && setDisableRadioButtons(true)
				// @ts-ignore
				dispatch(updateLink({ id: key, linkInfo: { disabled: true } }))
			}
		}
	}

	const createEnvelopes = async () => {
		for (const [key, value] of Object.entries(taxFormsLinks)) {
			// @ts-ignore
			if (value.envelope_id === '' && value.disabled === false) {
				const payload = {
					form_id: key,
				}
				// @ts-ignore
				dispatch(
					updateLink({
						id: key,
						linkInfo: { isCreatingEnvelop: true },
					} as any),
				)
				API.createEnvelope(taxDetails?.uuid, payload).then(response => {
					// @ts-ignore
					dispatch(
						updateLink({
							id: key,
							linkInfo: {
								envelope_id: response.envelope_id,
								document_id: response.document_id,
								record_id: response.record_id,
								isCreatingEnvelop: false,
							},
						} as any),
					)
				})
			}
		}
	}

	const checkedCheckbox = (e: any) => {
		const isChecked = e.target.checked
		const checkedValue = e.target.value
		if (isChecked === true) {
			const payload = {
				id: checkedValue,
				linkInfo: {
					documentName: checkedValue,
					checked: true,
					inputType: 'checkbox',
				},
			}
			// @ts-ignore
			dispatch(updateLink(payload))
		} else if (isChecked === false) {
			dispatch(deleteLink(checkedValue))
		}
	}

	const onDocumentDeletion = async (formId: string) => {
		// eslint-disable-next-line no-alert
		if (window.confirm('Are you sure you want to delete this file?')) {
			if (taxFormsLinks[formId]) {
				const recordId = taxFormsLinks[formId].record_id
				const documentId = taxFormsLinks[formId].document_id
				taxFormsLinks[formId].inputType === 'radio' &&
					setDisableRadioButtons(false)
				dispatch(deleteLink(formId))
				await API.deleteTaxDocument(recordId, documentId)
			}
		}
	}

	useEffect(() => {
		updateTaxPosition({
			moduleId: TAX_RECORD,
			externalId,
			currentStep: displayedFormNumber,
		})
	}, [displayedFormNumber])

	useEffect(() => {
		if (taxDetails && taxDetails.countries)
			setSelectedCountry(taxDetails.countries)
	}, [taxDetails])

	useEffect(() => {
		const positionDetails = first(taxPosition)
		const urlParams = getUrlParams()
		const envelopeId = urlParams.get('envelope_id')
		const position = get(positionDetails, 'last_position')
		const module = get(positionDetails, 'module')
		if (position && module === TAX_RECORD && !envelopeId) {
			setDisplayedFormNumber(Number(position))
		}
	}, [taxPosition])

	const onSubmitTaxDetails = async (values: any) => {
		await dispatch(
			updateTaxRecord({
				recordUUID: appRecords[0].tax_record.uuid,
				values: { countries: selectedCountry, ...values },
			}),
		)
		dispatch(fetchTaxDetails(appRecords[0].tax_record.uuid))
		logMixPanelEvent('Tax details form submitted', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
	}

	const handleTaxCountry = (value: OptionTypeBase) => {
		const countryIds = map(value, 'id')
		setSelectedCountry(countryIds)
	}

	const getSelectedCountry = () =>
		filter(geoSelector, (country: any) =>
			includes(selectedCountry, country.id),
		)

	const classes = useStyles()

	const selectedCountryNames = getSelectedCountry().map(
		country => country.label,
	)
	// const taxExemptLabel = (
	// 	<div>
	// 		Are you generally exempt from taxation in the countries:{' '}
	// 		<i>{selectedCountryNames.join(', ')}</i>
	// 	</div>
	// )

	const forms = [
		<>
			<Title>Country</Title>
			<div>
				In order to complete your investment application, we need to
				gather the relevant tax details.
				<br />
				<br />
				Please select the relevant country or countries of tax
				residency. Be sure to select the relevant country or countries
				depending on whether you are applying as an individual or
				entity.
			</div>

			<label htmlFor='country'>Country</label>
			<br />
			<Select
				isMulti
				options={geoSelector}
				value={getSelectedCountry()}
				onChange={handleTaxCountry}
			/>
			<ButtonWrapper>
			<span></span>
			<CustomButton
				onClick={async () => {
					await onSubmitTaxDetails({})
					setDisplayedFormNumber(Tax_FORM_STEPS.TAX_DETAILS)
				logMixPanelEvent('Tax country selector step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
				}}
				disabled={!size(selectedCountryNames)}
			>
				<ArrowForward /> Next Step
			</CustomButton>
			</ButtonWrapper>
		</>,
		<BSContainer fluid className='pb-5'>
			<br />
			Next, please provide following details
			<br />
			<br />
			<Formik
				initialValues={{
					us_holder: get(taxDetails, 'us_holder', ''),
					is_tax_exempt: get(taxDetails, 'is_tax_exempt', ''),
					is_entity: get(taxDetails, 'is_entity', ''),
					is_tax_exempt_in_country: get(
						taxDetails,
						'is_tax_exempt_in_country',
						'',
					),
					tin_or_ssn: get(taxDetails, 'tin_or_ssn', ''),
					kyc_investor_type_name: get(
						answers,
						'kyc_investor_type_name',
						'',
					),
					tax_year_end: get(taxDetails, 'tax_year_end', ''),
				}}
				enableReinitialize
				validationSchema={VALIDATION_SCHEMA}
				onSubmit={onSubmitTaxDetails}
			>
				{({
					values,
					handleChange,
					handleBlur,
					setFieldValue,
					isValid,
					isSubmitting,
				}) => {
					const taxYearEnd = getDateFromString(values.tax_year_end)
					return (
						<TaxForm>
							<AutoSave />
							<CustomInput
								title='U.S. Holder'
								type='radio'
								value={values.us_holder}
								handleChange={e =>
									setFieldValue('us_holder', e)
								}
								options={FORM_FIELDS_OPTIONS}
								fieldId='us_holder'
								error=''
							/>
							{values.us_holder === 'Yes' && (
								<CustomInput
									title='Are you Tax-Exempt under section 501(a) of the code'
									type='radio'
									value={values.is_tax_exempt}
									handleChange={e =>
										setFieldValue('is_tax_exempt', e)
									}
									options={FORM_FIELDS_OPTIONS}
									fieldId='is_tax_exempt'
									error=''
								/>
							)}
							{answers?.kyc_investor_type_name &&
								KYC_ENTITY_INVESTORS.includes(
									answers?.kyc_investor_type_name,
								) &&
								values.us_holder === 'Yes' && (
									<CustomInput
										title='Are you a partnership, estate, trust, S corporation, nominee or similar pass-through entity that is owned, directly or indirectly through one or more other such pass-through entities, by a U.S. Holder'
										type='radio'
										value={values.is_entity}
										handleChange={e =>
											setFieldValue('is_entity', e)
										}
										options={FORM_FIELDS_OPTIONS}
										fieldId='is_entity'
										error=''
									/>
								)}
							<div>
								<div>
									Are you generally exempt from taxation in
									the countries:{' '}
									<i>{selectedCountryNames.join(', ')}</i>
								</div>
								<CustomInput
									title=''
									type='radio'
									value={values.is_tax_exempt_in_country}
									handleChange={e =>
										setFieldValue(
											'is_tax_exempt_in_country',
											e,
										)
									}
									options={FORM_FIELDS_OPTIONS}
									fieldId='is_tax_exempt_in_country'
									error=''
								/>
							</div>
							<TextInput
								name='tin_or_ssn'
								label='Taxpayer Identification Number or Social Security Number'
								placeholder='Taxpayer Identification Number or Social Security Number'
								value={values.tin_or_ssn}
								onChange={handleChange}
								onBlur={handleBlur}
							/>
							<div>
								<Form.Label>
									Taxable year end of applicant
								</Form.Label>
								<TaxEndDiv>
									<DatePicker
										selected={taxYearEnd}
										onChange={(v: any) => {
											setFieldValue(
												'tax_year_end',
												moment
													.parseZone(v)
													.format('YYYY-MM-DD'),
											)
										}}
										dateFormat='MM/dd'
										name='tax_year_end'
										dateFormatCalendar='LLLL'
										onKeyDown={e => {
											e.preventDefault()
										}}
									/>
								</TaxEndDiv>
							</div>
							<ErrorMessage
								name='tax_year_end_day'
								component='div'
								className='errorText'
							/>
							<ButtonWrapper>
							<CustomButton
							variant='outlined'
							iconPosition='right'
							size='sm'
							onClick={() =>
								setDisplayedFormNumber(Tax_FORM_STEPS.COUNTRY_SELECTION)
							}
						>
							<ArrowBackIcon /> Previous Step
						</CustomButton>
							<CustomButton
								disabled={!isValid || isSubmitting}
								onClick={() => {
									setDisplayedFormNumber(
										Tax_FORM_STEPS.INVESTOR_FORMS,
									)
								}}
							>
								<ArrowForward /> Next Step
							</CustomButton>
							</ButtonWrapper>
						</TaxForm>
					)
				}}
			</Formik>
		</BSContainer>,
		<>
			<br />
			Next, please select the appropriate investor tax forms
			<br />
			<br />
			<Col md={12} className='mb-3'>
				<TableContainer component={Paper}>
					<Table className={classes.table} aria-label='simple table'>
						<TableHead>
							<TableRow>
								<TableCellHeader align='center'>
									Selection
								</TableCellHeader>
								<TableCellHeader align='center' width='130'>
									Form
								</TableCellHeader>
								<TableCellHeader align='center'>
									Description
								</TableCellHeader>
								<TableCellHeader align='center'>
									More Details
								</TableCellHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{taxForms.map((form: any) => {
								const checked =
									taxFormsLinks[form.form_id]?.checked ||
									false
								const disabled =
									taxFormsLinks[form.form_id]?.disabled ||
									false

								if (form.type === 'Goverment') {
									return (
										<TableRow key={form.form_id}>
											<TableCellBody align='center'>
												<input
													type='checkbox'
													onChange={e =>
														checkedCheckbox(e)
													}
													value={form.form_id}
													checked={checked}
													disabled={disabled}
												/>
											</TableCellBody>
											<TableCellBody align='center'>
												{form.form_id}
											</TableCellBody>
											<TableCellBody align='center'>
												{form.description}
											</TableCellBody>
											<TableCellBody align='justify'>
												<div
													// eslint-disable-next-line react/no-danger
													dangerouslySetInnerHTML={{
														__html: form.details,
													}}
												/>
											</TableCellBody>
										</TableRow>
									)
								}
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Col>
			<ButtonWrapper>
			<CustomButton
				variant='outlined'
				iconPosition='right'
				size='sm'
				onClick={() =>
					setDisplayedFormNumber(Tax_FORM_STEPS.TAX_DETAILS)
				}
			>
				<ArrowBackIcon /> Previous Step
			</CustomButton>
			<CustomButton
				onClick={async () => {
					setDisplayedFormNumber(Tax_FORM_STEPS.CERTIFICATION_FORMS)
					markDisabled()
					await createEnvelopes()
					logMixPanelEvent('Tax forms selection step', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
				}}
			>
				<ArrowForward /> Next Step
			</CustomButton>
			</ButtonWrapper>
		</>,
		<>
			<Title>Self-Certification</Title>
			Next, please select the appropriate Self-Certification
			<br />
			<br />
			<Col md={12} className='mb-3'>
				<TableContainer component={Paper}>
					<Table className={classes.table} aria-label='simple table'>
						<TableHead>
							<TableRow>
								<TableCellHeader align='center'>
									Selection
								</TableCellHeader>
								<TableCellHeader align='center'>
									Description
								</TableCellHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{taxForms.map((form: any) => {
								if (form.type === 'Self Certification') {
									const formName = form.form_id
									const checked =
										taxFormsLinks[formName]?.checked ||
										false

									return (
										<TableRow key={formName}>
											<TableCellBody align='center'>
												<input
													type='radio'
													onClick={() => {
														setSelectedRadioButton(
															formName,
														)
														const payload = {
															id: formName,
															linkInfo: {
																documentName:
																	formName,
																checked: true,
																inputType:
																	'radio',
															},
														}
														if (
															formName ===
															ENITY_CERTIFICATION_DOCUMENT_ID
														) {
															dispatch(
																deleteLink(
																	INDIVIDUAL_CERTIFICATION_DOCUMENT_ID,
																),
															)
														} else {
															dispatch(
																deleteLink(
																	ENITY_CERTIFICATION_DOCUMENT_ID,
																),
															)
														}
														// @ts-ignore
														dispatch(
															updateLink(
																payload as any,
															),
														)
													}}
													value={formName}
													checked={checked}
													name='self-certificate'
													disabled={
														disableRadioButtons
													}
												/>
											</TableCellBody>
											<TableCellBody align='center'>
												{form.description}
											</TableCellBody>
										</TableRow>
									)
								}
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Col>
			<ButtonWrapper>
			<CustomButton
				variant='outlined'
				iconPosition='right'
				size='sm'
				onClick={() =>
					setDisplayedFormNumber(Tax_FORM_STEPS.INVESTOR_FORMS)
				}
			>
				<ArrowBackIcon /> Previous Step
			</CustomButton>
			<CustomButton
				onClick={async () => {
					setDisplayedFormNumber(Tax_FORM_STEPS.DOCUMENTS)
					markDisabled()
					await createEnvelopes()
				}}
			>
				<ArrowForward /> Next Step
			</CustomButton>
			</ButtonWrapper>
		</>,
		<>
			<Title>Documents</Title>
			<div>Click on each link to start filling out the forms.</div>
			<br />

			<Col md={12} className='mb-3'>
				<TableContainer component={Paper}>
					<Table className={classes.table} aria-label='simple table'>
						<TableHead>
							<TableRow>
								<TableCellHeader align='center'>
									Document
								</TableCellHeader>
								<TableCellHeader align='center'>
									Status
								</TableCellHeader>
								<TableCellHeader align='center'>
									Actions
								</TableCellHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{Object.keys(taxFormsLinks).length === 0 ||
								(isUpdatingDocument && (
									<TableRow key={1}>
										<TableCellBody
											colSpan={3}
											align='center'
										>
											<NavableLoader />
										</TableCellBody>
									</TableRow>
								))}
							{!isUpdatingDocument &&
								Object.keys(taxFormsLinks).map(form => (
									<TableRow key={form}>
										<TableCellBody align='center'>
											{taxFormsLinks[form].status ===
											'Completed' ? (
												<span>{form}</span>
											) : (
												<FakeLink
													onClick={() => {
														if (
															disableLinks ===
																false &&
															taxFormsLinks[form]
																.isCreatingEnvelop ===
																false &&
															externalId
														) {
															setDisableLinks(
																true,
															)
															signingUrl(
																taxFormsLinks[
																	form
																].envelope_id,
																externalId,
															)
														}
													}}
													disableLink={
														disableLinks ||
														taxFormsLinks[form]
															.isCreatingEnvelop
													}
												>
													{
														taxFormsLinks[form]
															.documentName
													}
												</FakeLink>
											)}
										</TableCellBody>

										<TableCellBody align='center'>
											{taxFormsLinks[form].status}
										</TableCellBody>
										<TableCellBody align='center'>
											<DeleteOutlineIcon
												htmlColor='#F42222'
												style={{ cursor: 'pointer' }}
												onClick={() =>
													onDocumentDeletion(form)
												}
											/>
										</TableCellBody>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
			</Col>
			<br />

			{Object.keys(taxFormsLinks).length > 0 &&
				!Object.values(taxFormsLinks).some(
					(form: any) => form.status === 'Pending',
				) &&
				!taxDocumentsList.some(
					(record: any) => record.completed === 'False',
				) &&
				'You have successfully completed all the selected forms.'}

			<br />
			<ButtonWrapper>
			<CustomButton
				variant='outlined'
				iconPosition='right'
				size='sm'
				onClick={() =>
					setDisplayedFormNumber(Tax_FORM_STEPS.INVESTOR_FORMS)
				}
			>
				<ArrowBackIcon /> Change Forms
			</CustomButton>
			<CustomButton
				onClick={() => {
					externalId &&
						API.createTaxReviewTask(
							externalId,
							appRecords[0].tax_record.uuid,
						)
					history(`/${company}/funds/${externalId}/bank_details`)
				}}
			>
				<ArrowForward /> Add banking details
			</CustomButton>
			</ButtonWrapper>
		</>,
	]

	return (
		<PageWrapper>
			<Container>
				<BigTitle>Tax Forms</BigTitle>

				<StyledForm onSubmit={() => console.log()}>
					<FormContainer>
					<BackToApplication />
						{forms[displayedFormNumber]}
						</FormContainer>
				</StyledForm>
			</Container>
		</PageWrapper>
	)
}

export default hasOnBoardingPermission(TaxFormsPage)
