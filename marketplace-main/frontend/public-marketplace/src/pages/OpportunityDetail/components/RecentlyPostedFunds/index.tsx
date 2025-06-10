import { useGetUserOpportunitiesQuery } from 'api/rtkQuery/tasksApi'
import { IOpportunity } from 'interfaces/Opportunities'
import RecentFunds from 'pages/HomePage/components/RecentFunds'
import { useParams } from 'react-router-dom'

const RecentlyPostedFunds = () => {
	const { externalId } = useParams()
	const { data: opportunitiesData, isLoading: isLoadingOpportunities } =
		useGetUserOpportunitiesQuery()

	const getOpportunities = (
		opportunities: IOpportunity[] | undefined,
		active: boolean,
	) =>
		opportunities?.filter(
			(opportunitiy: { close_applications: boolean, external_id: string }) =>
				opportunitiy.close_applications !== active && opportunitiy.external_id !== externalId
		)

	return (
		<RecentFunds
			title='Other funds'
			keyPrefix='recent-funds'
			isLoading={isLoadingOpportunities}
			opportunities={getOpportunities(opportunitiesData, true)}
		/>
	)
}

export default RecentlyPostedFunds
