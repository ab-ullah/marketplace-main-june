import { SxProps } from '@mui/system'
import Logo from 'assets/images/NavableLogo.png'
import { CardCont, Text, CompanyLogo } from './styled'
import { useTheme } from '@mui/material/styles'
import get from 'lodash/get'

const SponsoredCard = ({ sx }: { sx?: SxProps }) => {
	const theme = useTheme()
	const techPartnerLogo = get(theme, 'components.tech_partner_logo')
	return (
		<CardCont sx={sx}>
			<Text>
				This investment plaform is being powered by our financial
				technology partner
			</Text>
			<CompanyLogo src={techPartnerLogo || Logo} />
		</CardCont>
	)
}

export default SponsoredCard

SponsoredCard.defaultProps = {
	sx: {},
}
