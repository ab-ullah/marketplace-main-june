import { useNavigate, useParams } from 'react-router-dom'
import { IActiveApplicationFund } from 'interfaces/common/applicationStatus'
import Button from 'components/Button/ThemeButton'
import EastIcon from '@mui/icons-material/East'
import { Cont, ColView, RowView, Title, Text, StatusCell } from './styled'
import { toLower } from 'lodash'
import arrowRight from "../../../../../assets/images/white-arrow-right.svg"
import {INVESTOR_ORIGIN, INVESTOR_URL_PREFIX} from 'constants/routes'
import { advisorSelectedHexParam } from 'utils/helpers'

const CONTINUE_STATUS = ['continue', 'approved']

const ApplicationTile = ({
	application,
}: {
	application: IActiveApplicationFund
}) => {
	const {
		name,
		focus_region,
		type,
		risk_profile,
		application_status,
		continue_url,
		external_id,
	} = application
	const navigate = useNavigate()
	const { company } =useParams()
	const continuePageName = continue_url.split('/').pop()

	const generatePageUrl = () => {
		return `${INVESTOR_ORIGIN}/${company}/${INVESTOR_URL_PREFIX}/funds/${external_id}/application?mp=true${advisorSelectedHexParam()}`
	}

	const viewDetails = () => {
		navigate(
			`/${company}/opportunity/${external_id}/detail`,
		)
	}

	return (
		<Cont>
			<ColView>
				<Title onClick={viewDetails} className={'cursor-pointer'}>{name}</Title>
				{toLower(application_status) === 'changes_requested' && <StatusCell>Changes Requested</StatusCell>}
			</ColView>
			<RowView>
				<ColView>
					<Text>{focus_region}</Text>
					<Text>{type}</Text>
					<Text>{risk_profile}</Text>
				</ColView>
				<Button
						contSx={{ minWidth: '200px' }}
						position='right'
						solo
						onClick={() =>
							window.open(
								generatePageUrl(),"_self"
							)
						}
						size='sm'
					>
					<img src={arrowRight} className={'ms-2'}/> View Application
					</Button>
			</RowView>
		</Cont>
	)
}

export default ApplicationTile
