import Loader from 'components/Loader'
import Grid from '@mui/material/Grid'
import { defaultPagePadding } from 'constants/global'
import { IActiveApplicationFund } from 'interfaces/common/applicationStatus'
import ApplicationTile from './ApplicationTile'
import { StartPageSectionHeading } from './styled'
import { map, size } from 'lodash'
import NoDataMessage from './NoDataMesage'
import { NO_APPLICATIONS } from 'constants/defaultValues'

interface InvestmentOpportunitiesProps {
	isLoading: boolean
	applications: IActiveApplicationFund[]
	scrollRef:
		| ((instance: HTMLHeadingElement | null) => void)
		| React.RefObject<HTMLHeadingElement>
		| null
		| undefined
}

const ActiveApplications = ({
	isLoading,
	scrollRef,
	applications,
}: InvestmentOpportunitiesProps) => {
	if(size(applications) === 0 && !isLoading) {
		return <div style={{ padding: defaultPagePadding }}>
			<StartPageSectionHeading ref={scrollRef}>
				Applications
			</StartPageSectionHeading>
			<NoDataMessage text={NO_APPLICATIONS} />
		</div>
	}

	return (
		<div style={{ padding: defaultPagePadding }}>
			<StartPageSectionHeading ref={scrollRef}>
				Applications
			</StartPageSectionHeading>
			{isLoading ? (
				<Loader />
			) : (
				<Grid
					container
					rowSpacing={1}
					columnSpacing={{ xs: 1, sm: 2, md: 3 }}
				>
					{map(applications, application => (
						<Grid item xs={12} md={6} key={application.external_id}>
							<ApplicationTile application={application} />
						</Grid>
					))}
				</Grid>
			)}
		</div>
	)
}

export default ActiveApplications
