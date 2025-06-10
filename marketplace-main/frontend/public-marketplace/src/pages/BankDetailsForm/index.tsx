/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FunctionComponent, useEffect, useState } from 'react'
import get from 'lodash/get'
import size from 'lodash/size'
import first from 'lodash/first'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchGeoSelector } from 'pages/TaxForms/thunks'
import { BANKING_DETAILS } from '../../constants/commentModules'
import { PageWrapper } from 'components/Page'
import { useAppDispatch } from '../../app/hooks'
import {
	useFetchBankingDetailsQuery,
	useFetchModulePositionQuery,
	useFetchProgramDocsQuery, useGetApplicationStatusQuery,
	useGetDocumentsQuery,
	useGetFundDetailsQuery,
	useSaveBankingDetailsMutation,
	useUpdateModulePositionMutation,
} from '../../api/rtkQuery/fundsApi'
import DetailsForm from './Form'
import Confirmation from './ConfirmationSection'
import { hasOnBoardingPermission } from '../../components/FundReview/onboardingPermission'
import { Params } from '../TaxForms/interfaces'
import { BigTitle, Container, FormContainer } from '../TaxForms/styles'
import { logMixPanelEvent } from 'utils/mixpanel'
import Loader from 'components/Loader'
import BackToApplication from 'components/BackToApplication'
import { IApplicationStatus } from 'interfaces/application'


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface BankDetailsFormProps {}

const BankDetailsForm: FunctionComponent<BankDetailsFormProps> = () => {
	const dispatch = useAppDispatch()
	const [showConfirmation, setShowConfirmation] = useState(false)
	const history = useNavigate()
	// @ts-ignore
	const { externalId, company } = useParams<Params>()
	// @ts-ignore
	const [updateBankDetailPosition] = useUpdateModulePositionMutation()
	const [saveBankingDetails] = useSaveBankingDetailsMutation()
	const { refetch: refetchAppStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(
		externalId, {
			skip: !externalId,
		}
	);

	const { data: documents } = useGetDocumentsQuery(externalId, {
		skip: !externalId,
	})
	const { data: programDocuments } = useFetchProgramDocsQuery(
		{ externalId, skipRquiredOnce: true },
		{
			skip: !externalId,
		},
	)
	const { data: bankPositionDetails } = useFetchModulePositionQuery(
		externalId,
		{
			skip: !externalId,
		},
	)
	const positionDetails = first(bankPositionDetails)

	const { data: bankingApiData, isLoading: isLoadingBankingData } =
		useFetchBankingDetailsQuery(externalId, {
			skip: !externalId,
		})

	const { data: fundDetails } = useGetFundDetailsQuery(externalId)

	useEffect(() => {
		updateBankDetailPosition({
			moduleId: BANKING_DETAILS,
			externalId,
			currentStep: 0,
		})
		refetchAppStatus()
	}, [])

	useEffect(() => {
		if (externalId) {
			dispatch(fetchGeoSelector(externalId))
		}
	}, [externalId])

	useEffect(()=>{
		window.scrollTo(0,0)
	  },[isLoadingBankingData])

	const onSubmit = (values: any) => {
		saveBankingDetails({
			externalId,
			...values,
			currency: get(values, 'currency.value'),
			bank_country: get(values, 'bank_country.value'),
		})
			.then(async (resp: any) => {
				if (resp.data) {
					await refetchAppStatus()
					if (programDocuments.length > 0) {
						history(`/${company}/funds/${externalId}/program_doc`)
					} else if (size(documents) === 0) setShowConfirmation(true)
					else history(`/${company}/funds/${externalId}/review_docs`)
					logMixPanelEvent('Bank details submitted', get(fundDetails, 'company.name'), get(fundDetails, 'company.slug'))
				}
			})
			.catch(e => {
				// eslint-disable-next-line no-console
				console.log({ e })
			})
	}

	// eslint-disable-next-line react/jsx-no-useless-fragment
	// if (isLoadingBankingData) return <Loader/>

	if (
		(showConfirmation && size(documents) === 0) ||
		(get(positionDetails, 'last_position') === '1' &&
			get(positionDetails, 'module') === BANKING_DETAILS)
	)
		return (
			<PageWrapper>
		<Container>
			<Confirmation
				moduleId={BANKING_DETAILS}
				redirectUrl={`/funds/${externalId}/agreements`}
			/>
				</Container>
		</PageWrapper>
		)

	return (
		<PageWrapper>
		<Container>
			<BigTitle>Banking Details</BigTitle>

			<FormContainer>
				{isLoadingBankingData? <Loader/>
				:
				<>
				<BackToApplication className='mb-4'/>
				<DetailsForm
					details={first(bankingApiData)}
					handleSubmit={onSubmit}
				/></>}
			</FormContainer>
		</Container>
		</PageWrapper>
	)
}

export default hasOnBoardingPermission(BankDetailsForm)
