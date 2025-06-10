import { FC, useEffect, useRef, useState } from 'react'
import size from 'lodash/size'
import { IOpportunity } from 'interfaces/Opportunities'
import { upperFirst } from 'lodash'
import {
	useGetActiveApplicationFundQuery,
	useGetInvestedCountQuery,
	useGetUserOpportunitiesQuery,
	api,
	tagTypes
} from 'api/rtkQuery/tasksApi'
import { PageWrapper } from 'components/Page'
import Loader from 'components/Loader'
import { getUserInfo } from 'services/User'
import { UserInfo } from 'interfaces/User'
import { Grid } from '@mui/material'
import StatusBar from './components/StatusBar'
import ActiveApplications from './components/ActiveApplications'
import InvestmentOppotunities from './components/InvestmentOpportunities'
import RecentFunds from './components/RecentFunds'
import { TopRow, WelcomeBackText } from './styled'
import { IActiveApplicationFund } from 'interfaces/common/applicationStatus'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { useAppSelector } from 'app/hooks'
import { selectAdvisorId } from 'pages/User/selectors'
import { getAdvisorSelectedFirstName } from 'utils/helpers'

const HomePage: FC<unknown> = () => {
	const dispatch = useDispatch()
	const { data: opportunitiesData, isLoading: isLoadingOpportunities } =
		useGetUserOpportunitiesQuery()
	const { data: investedCountData } = useGetInvestedCountQuery()
	const { data: activeApplicationFunds } = useGetActiveApplicationFundQuery()
	const [user, setUser] = useState<UserInfo | null>(null)
	const refApp = useRef<HTMLHeadingElement>(null)
	const refOpp = useRef<HTMLHeadingElement>(null)

	const advisorId = useAppSelector(selectAdvisorId)

	const handleUserInfo = async () => {
		const res = await getUserInfo()
		if (res.success) {
			setUser(res.data)
		}
	}

	const scrollToRef = (ref: string) => {
		switch (ref) {
			case 'refApp':
				window.scrollBy(0, (refApp.current?.offsetTop as number) - 130)
				break
			case 'refOpp':
				window.scrollBy(0, (refOpp.current?.offsetTop as number) - 130)
				break

			default:
				break
		}
	}

	const getOpportunities = (
		opportunities: IOpportunity[] | undefined,
		active: boolean,
	) =>
		opportunities?.filter(
			(opportunitiy: { close_applications: boolean }) =>
				opportunitiy.close_applications !== active,
		)

	useEffect(() => {
		handleUserInfo()
	}, [])

	useEffect(() => {
		// dispatch(api.util.invalidateTags(tagTypes));
	}, [advisorId, dispatch]);

	if (isLoadingOpportunities) {
		return <Loader />
	}

	return (
		<PageWrapper>
			<div style={{ minHeight: '80vh' }}>
				<TopRow container>
					<Grid item xs={12} sm={12} md={5}>
						<WelcomeBackText>
							Welcome, {getAdvisorSelectedFirstName() || upperFirst(user?.first_name)}!
						</WelcomeBackText>
					</Grid>
					<Grid
						item
						xs={12}
						sm={12}
						md={7}
						sx={{ display: 'flex', justifyContent: 'flex-end' }}
					>
						<StatusBar
							opportunitiesCount={size(opportunitiesData)}
							investmentsCount={
								investedCountData
									? investedCountData.invested_count
									: 0
							}
							activeApplicationCount={size(
								activeApplicationFunds,
							)}
							scrollTo={scrollToRef}
						/>
					</Grid>
				</TopRow>
				<ActiveApplications
					isLoading={isLoadingOpportunities}
					scrollRef={refApp}
					applications={
						activeApplicationFunds as IActiveApplicationFund[]
					}
				/>
				<InvestmentOppotunities
					isLoading={isLoadingOpportunities}
					opportunities={getOpportunities(opportunitiesData, true)}
					scrollRef={refOpp}
				/>
				<RecentFunds
					title='Our most recently closed funds'
					keyPrefix='closed-funds'
					isLoading={isLoadingOpportunities}
					opportunities={getOpportunities(opportunitiesData, false)}
				/>
			</div>
		</PageWrapper>
	)
}

export default HomePage
