import { IOpportunity } from 'interfaces/Opportunities'
import { FC } from 'react'
import Loader from 'components/Loader'
import useWindowDimensions from 'utils/WindowDimensions'
import { defaultPagePadding } from 'constants/global'
import FundCardLayout from 'pages/HomePage/components/FundCardLayout'
import { Cont, Title } from './styled'
import Arrow from './components/Arrow'

interface InvestmentOpportunitiesProps {
	opportunities?: IOpportunity[]
	isLoading: boolean
	title: string
	keyPrefix: string
}

const ClosedFunds: FC<InvestmentOpportunitiesProps> = ({
	opportunities,
	title,
	keyPrefix,
	isLoading,
}) => {
	const { width } = useWindowDimensions()
	const isSM = () => width < 600
	if (isLoading)
		return (
			<Cont>
				<Loader />
			</Cont>
		)
	// eslint-disable-next-line react/jsx-no-useless-fragment
	if (!opportunities || opportunities?.length === 0) return <></>
	return (
		<div style={isSM() ? {} : { padding: defaultPagePadding }}>
			<Cont>
				<Arrow />
				<Title>{title}</Title>
				<FundCardLayout
					opportunities={opportunities}
					keyPrefix={keyPrefix}
				/>
			</Cont>
		</div>
	)
}

export default ClosedFunds

ClosedFunds.defaultProps = {
	opportunities: undefined,
}
