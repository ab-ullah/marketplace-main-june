import { FunctionComponent } from 'react'
import { BarCont, BarBtn, BarCounter } from './styled'
import { INVESTOR_ORIGIN, INVESTOR_URL_PREFIX } from 'constants/routes'
import { useLocation } from 'react-router-dom'
import { advisorSelectedHexParam } from 'utils/helpers'

interface StatusBarProps {
	activeApplicationCount: number
	opportunitiesCount: number
	investmentsCount: number
	scrollTo: (ref: string) => void
}

const StatusBar: FunctionComponent<StatusBarProps> = ({
	activeApplicationCount,
	opportunitiesCount,
	investmentsCount,
	scrollTo,
}) => {
	const location = useLocation();
	const companyName = location.pathname.split('/')[1]

	return (
		<BarCont>
		<BarBtn
			role='button'
			onClick={() => scrollTo('refApp')}
			sx={{
				borderRight: { md: '1px #C1CEE9 solid' },
			}}
		>
			<BarCounter>{activeApplicationCount}</BarCounter>
			{activeApplicationCount === 1 ? 'Application' : 'Applications'}
		</BarBtn>
		<BarBtn
			role='button'
			onClick={() => scrollTo('refOpp')}
			sx={{
				borderRight: { md: '1px #C1CEE9 solid' },
			}}
		>
			<BarCounter>{opportunitiesCount}</BarCounter>
			{opportunitiesCount === 1 ? 'Opportunity' : 'Opportunities'}
		</BarBtn>
		<BarBtn
			role='button'
			onClick={() => window.open(`${INVESTOR_ORIGIN}/${companyName}/${INVESTOR_URL_PREFIX}/ownership?mp=true${advisorSelectedHexParam()}`,'_self')}
			sx={{ borderBottom: '0px !important' }}
		>
			<BarCounter>{investmentsCount}</BarCounter>
			{investmentsCount === 1
				? 'Active Investment'
				: 'Active Investments'}
		</BarBtn>
	</BarCont>
	)
}

export default StatusBar
