import Button from 'components/Button/ThemeButton'
import { useGetUserOpportunitiesQuery } from 'api/rtkQuery/tasksApi'
import { IOpportunity } from 'interfaces/Opportunities'
import { defaultVPadding } from 'constants/global'
import FundCardLayout from 'pages/HomePage/components/FundCardLayout'
import Loader from 'components/Loader'
import { Title, TopRow } from './styled'

const RecentOpportunities = () => {
	const { data: opportunitiesData, isLoading: isLoadingOpportunities } =
		useGetUserOpportunitiesQuery()

	const getOpportunities = (
		opportunities: IOpportunity[] | undefined,
		active: boolean,
	) =>
		opportunities?.filter(
			(opportunitiy: { close_applications: boolean }) =>
				opportunitiy.close_applications !== active,
		)

	return (
		<div style={{ padding: `${defaultVPadding} 0px` }}>
			<TopRow>
				<Title>Recently posted opportunities</Title>
				<Button position='right' variant='outlined'>
					See all opportunites
				</Button>
			</TopRow>
			<div>
				{isLoadingOpportunities ? (
					<Loader />
				) : (
					<FundCardLayout
						opportunities={getOpportunities(
							opportunitiesData,
							true,
						)?.slice(0, 3)}
						keyPrefix='recent-opportunities'
					/>
				)}
			</div>
		</div>
	)
}

export default RecentOpportunities
