import { IFundManager } from 'interfaces/Opportunities'
import { Cont, Biography } from './styled'
import IdentityCard from './components/IdentityCard'

const EmployeeDetails = ({ manager }: { manager: IFundManager }) => (
	<Cont>
		<IdentityCard details={manager} />
		<Biography>{manager.bio}</Biography>
	</Cont>
)

export default EmployeeDetails
