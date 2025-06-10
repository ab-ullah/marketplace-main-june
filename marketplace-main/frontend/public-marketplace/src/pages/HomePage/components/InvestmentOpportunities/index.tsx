import React, { FC } from 'react'
import { IOpportunity } from 'interfaces/Opportunities'
import Loader from 'components/Loader'
import { defaultPagePadding } from 'constants/global'
import FundCardLayout from 'pages/HomePage/components/FundCardLayout'
import { StartPageSectionHeading } from './styled'

interface InvestmentOpportunitiesProps {
	isLoading: boolean
	opportunities?: IOpportunity[]
	scrollRef:
		| ((instance: HTMLHeadingElement | null) => void)
		| React.RefObject<HTMLHeadingElement>
		| null
		| undefined
}

const InvestmentOppotunities: FC<InvestmentOpportunitiesProps> = ({
	isLoading,
	opportunities,
	scrollRef,
}) => (
	<div style={{ padding: defaultPagePadding }}>
		<StartPageSectionHeading ref={scrollRef}>
			Investment Opportunities
		</StartPageSectionHeading>
		{isLoading ? (
			<Loader />
		) : (
			<FundCardLayout
				opportunities={opportunities}
				showSponsoredCard
				keyPrefix='investment-opportunities'
			/>
		)}
	</div>
)

export default InvestmentOppotunities

InvestmentOppotunities.defaultProps = {
	opportunities: undefined,
}
