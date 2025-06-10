/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/require-default-props */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionComponent, useEffect, useMemo } from 'react'
import get from 'lodash/get'
import map from 'lodash/map'
import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { Formik } from 'formik'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import { useParams } from 'react-router-dom'
import { fetchGeoSelector } from 'pages/TaxForms/thunks'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectGeoSelector } from '../TaxForms/selectors'
import { useGetCurrenciesQuery } from '../../api/rtkQuery/commonApi'
import TextField from '../../components/Form/TextField'
import SelectorField from './countrySelect'
import CommentsSection from './comments'
import { Params } from '../TaxForms/interfaces'
import { getSchema, initValues } from './config'
import { ICurrency } from '../../interfaces/currency'
import { Checkbox } from '../TaxForms/styles'
import NextButton from '../../components/Button/ThemeButton'
import { IBankingDetails } from '../../interfaces/bankingDetails'
import { ArrowForward } from '@material-ui/icons'
import { ButtonRow } from 'pages/KnowYourCustomer/styles'
import { ButtonWrapper } from 'pages/OpportunityOnboarding/components/FinalStep/components/InvestmentProposalSection/styled'

interface BankDetailsFormProps {
	details?: IBankingDetails
	submitOnBlur?: boolean
	handleSubmit?: any
	comments?: any
}

const BankDetailsForm: FunctionComponent<BankDetailsFormProps> = ({
	details,
	comments,
	submitOnBlur,
	handleSubmit,
}) => {
	const dispatch = useAppDispatch()
	// @ts-ignore
	const { externalId } = useParams<Params>()
	const countriesApiData = useAppSelector(selectGeoSelector)

	const { data: currenciesApiData, isLoading: isLoadingCurrencies } =
		// @ts-ignore
		useGetCurrenciesQuery(externalId, {
			skip: !externalId,
		})

	const countries = useMemo(
		() =>
			map(countriesApiData, (country: any) => ({
				value: country.id,
				label: country.label,
			})),
		[countriesApiData],
	)

	const US_BANK_ID = useMemo(() => {
		const country = find(
			countries,
			// eslint-disable-next-line no-shadow
			(country: any) => toLower(country.label) === 'united states',
		)
		return country?.value
	}, [countries])

	const currencies = useMemo(
		() =>
			map(currenciesApiData, (currency: ICurrency) => ({
				value: currency.id,
				label: currency.code,
			})),
		[currenciesApiData],
	)

	const getInitialData = () => {
		if (details) {
			return {
				...details,
				bank_country:
					find(
						countries,
						(country: any) =>
							country.value === details.bank_country,
					) || null,
				currency:
					find(
						currencies,
						(currency: any) => currency.value === details.currency,
					) || null,
			}
		}
		return initValues
	}

	useEffect(() => {
		externalId && dispatch(fetchGeoSelector(externalId))
	}, [dispatch, externalId])

	// eslint-disable-next-line react/jsx-no-useless-fragment
	if (!US_BANK_ID || !currencies || isLoadingCurrencies) return <></>

	return (
		<Formik
			initialValues={getInitialData()}
			validationSchema={getSchema(US_BANK_ID)}
			onSubmit={handleSubmit}
		>
			{({
				values,
				handleChange,
				handleBlur,
				handleSubmit,
				setFieldValue,
				isSubmitting,
				isValid,
			}) => {
				const onBlur = (event: any) => {
					handleBlur(event)
					submitOnBlur && handleSubmit()
				}
				return (
					<>
						<SelectorField
							// @ts-ignore
							label='Where is your bank located?'
							name='bank_country'
							className='mt-2'
							placeholder='Where is your bank located?'
							onChange={(value: any) =>
								setFieldValue('bank_country', value)
							}
							value={values.bank_country}
							options={countries}
						/>
						<CommentsSection
							fieldId='bank_country'
							comments={comments}
						/>

						{values.bank_country && (
							<>
								<Row>
									<Col>
										<TextField
											label='Bank name'
											placeholder='Bank name'
											name='bank_name'
											value={values.bank_name}
											onChange={handleChange}
											onBlur={onBlur}
											onFocus={() => {}}
										/>
										<CommentsSection
											fieldId='bank_name'
											comments={comments}
										/>
									</Col>
									<Col>
										{get(values, 'bank_country.value') ===
											US_BANK_ID && (
											<>
												<TextField
													label='Routing number'
													placeholder='Routing number'
													name='routing_number'
													value={
														values.routing_number
													}
													onChange={handleChange}
													onBlur={onBlur}
													onFocus={() => {}}
												/>
												<CommentsSection
													fieldId='routing_number'
													comments={comments}
												/>
											</>
										)}
										{get(values, 'bank_country.value') !==
											US_BANK_ID && (
											<>
												<TextField
													label='Swift/ABA'
													placeholder='Swift/ABA'
													name='swift_code'
													value={values.swift_code}
													onChange={handleChange}
													onBlur={onBlur}
													onFocus={() => {}}
												/>
												<CommentsSection
													fieldId='swift_code'
													comments={comments}
												/>
											</>
										)}
									</Col>
								</Row>
								{get(values, 'bank_country.value') !==
									US_BANK_ID && (
									<>
										<Row className='mt-2'>
											<Col>
												<Checkbox
													type='checkbox'
													label='I need to add an Intermediary Bank'
													onChange={(value: any) =>
														setFieldValue(
															'have_intermediary_bank',
															!values.have_intermediary_bank,
														)
													}
													value={`${values.have_intermediary_bank}`}
													checked={
														values.have_intermediary_bank
													}
													onClick={(e: any) =>
														e.stopPropagation()
													}
													id={`approval-${values.have_intermediary_bank}`}
												/>
												<CommentsSection
													fieldId='have_intermediary_bank'
													comments={comments}
												/>
											</Col>
										</Row>

										{values.have_intermediary_bank && (
											<Card>
												<Card.Body>
													<Row>
														<Col>
															<TextField
																name='intermediary_bank_name'
																label='Bank name'
																placeholder='Bank name'
																value={
																	values.intermediary_bank_name
																}
																onChange={
																	handleChange
																}
																onBlur={onBlur}
																onFocus={() => {}}
															/>
															<CommentsSection
																fieldId='intermediary_bank_name'
																comments={
																	comments
																}
															/>
														</Col>
														<Col>
															<TextField
																name='intermediary_bank_swift_code'
																label='Swift/ABA'
																placeholder='Swift/ABA'
																value={
																	values.intermediary_bank_swift_code
																}
																onChange={
																	handleChange
																}
																onBlur={onBlur}
																onFocus={() => {}}
															/>
															<CommentsSection
																fieldId='intermediary_bank_swift_code'
																comments={
																	comments
																}
															/>
														</Col>
													</Row>
												</Card.Body>
											</Card>
										)}
									</>
								)}

								<TextField
									name='street_address'
									label='Street address of the bank'
									placeholder='Street address of the bank'
									value={values.street_address}
									onChange={handleChange}
									onBlur={onBlur}
									onFocus={() => {}}
								/>
								<CommentsSection
									fieldId='street_address'
									comments={comments}
								/>
								<Row>
									<Col>
										<TextField
											name='city'
											label='City'
											placeholder='City'
											value={values.city}
											onChange={handleChange}
											onBlur={onBlur}
											onFocus={() => {}}
										/>
										<CommentsSection
											fieldId='city'
											comments={comments}
										/>
									</Col>
									<Col>
										{get(values, 'bank_country.value') ===
										US_BANK_ID ? (
											<>
												<TextField
													name='state'
													label='State'
													placeholder='State'
													value={values.state}
													onChange={handleChange}
													onBlur={onBlur}
													onFocus={() => {}}
												/>
												<CommentsSection
													fieldId='state'
													comments={comments}
												/>
											</>
										) : (
											<>
												<TextField
													name='province'
													label='Local Area or Village Name (optional)'
													placeholder='Province'
													value={values.province}
													onChange={handleChange}
													onBlur={onBlur}
													onFocus={() => {}}
												/>
												<CommentsSection
													fieldId='province'
													comments={comments}
												/>
											</>
										)}
									</Col>
									<Col>
										<TextField
											name='postal_code'
											label='Postal code'
											placeholder='Postal code'
											value={values.postal_code}
											onChange={handleChange}
											onBlur={onBlur}
											onFocus={() => {}}
										/>
										<CommentsSection
											fieldId='postal_code'
											comments={comments}
										/>
									</Col>
								</Row>
								<TextField
									name='account_name'
									label='Account name'
									placeholder='Account name'
									value={values.account_name}
									onChange={handleChange}
									onBlur={onBlur}
									onFocus={() => {}}
								/>
								<CommentsSection
									fieldId='account_name'
									comments={comments}
								/>
								<TextField
									name='account_number'
									label='Account number'
									placeholder='Account number'
									value={values.account_number}
									onChange={handleChange}
									onBlur={onBlur}
									onFocus={() => {}}
								/>
								<CommentsSection
									fieldId='account_number'
									comments={comments}
								/>

								{get(values, 'bank_country.value') !==
									US_BANK_ID && (
									<>
										<TextField
											name='iban_number'
											label='IBAN number'
											placeholder='IBAN number'
											value={values.iban_number}
											onChange={handleChange}
											onBlur={onBlur}
											onFocus={() => {}}
										/>
										<CommentsSection
											fieldId='iban_number'
											comments={comments}
										/>
									</>
								)}
								<TextField
									name='credit_account_name'
									label='For further credit account name (optional)'
									placeholder='For further credit account name (optional)'
									value={values.credit_account_name}
									onChange={handleChange}
									onBlur={onBlur}
									onFocus={() => {}}
								/>
								<CommentsSection
									fieldId='credit_account_name'
									comments={comments}
								/>
								<TextField
									name='credit_account_number'
									label='For further credit account number (optional)'
									placeholder='For further credit account number (optional)'
									value={values.credit_account_number}
									onChange={handleChange}
									onBlur={onBlur}
									onFocus={() => {}}
								/>
								<CommentsSection
									fieldId='credit_account_number'
									comments={comments}
								/>

								{!isLoadingCurrencies && (
									<>
										<SelectorField
											// @ts-ignore
											label='Currency'
											name='currency'
											placeholder='Currency'
											className='mt-2'
											onChange={(value: any) =>
												setFieldValue('currency', value)
											}
											value={values.currency}
											options={currencies}
										/>
										<CommentsSection
											fieldId='currency'
											comments={comments}
										/>
									</>
								)}

								<TextField
									name='reference'
									label='Reference (optional)'
									placeholder='Reference (optional)'
									value={values.reference}
									onChange={handleChange}
									onBlur={onBlur}
									onFocus={() => {}}
								/>
								<CommentsSection
									fieldId='reference'
									comments={comments}
								/>
							</>
						)}
						{!submitOnBlur && (
							<Row className='mt-4'>
								<Col>
									<ButtonWrapper>
									<div />
									<NextButton
										onClick={(e: any) => {
											e.preventDefault()
											handleSubmit()
										}}
										disabled={isSubmitting && !isValid}
									>
										<ArrowForward /> Submit
									</NextButton>
									</ButtonWrapper>
								</Col>
							</Row>
						)}
					</>
				)
			}}
		</Formik>
	)
}

export default BankDetailsForm
