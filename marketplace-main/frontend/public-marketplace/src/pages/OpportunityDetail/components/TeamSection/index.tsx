import { ScrollRefType } from 'interfaces/common/refs'
import { IFundManager } from 'interfaces/Opportunities'
import { Title, Column } from './styled'
import EmployeeDetails from './components/EmployeeDetails'

interface TeamSectionProps {
	scrollRef: ScrollRefType
	managers: IFundManager[]
}

const TeamSection = ({ scrollRef, managers }: TeamSectionProps) => (
	<div ref={scrollRef}>
		<Title>The management fund team</Title>
		<Column>
			{managers.map(manager => (
				<EmployeeDetails manager={manager} />
			))}
		</Column>
	</div>
)

export default TeamSection
