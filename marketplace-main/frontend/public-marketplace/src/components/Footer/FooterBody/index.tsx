import map from 'lodash/map'
import {
	AddressButton,
	AddressSection,
	FooterSection,
	FooterText,
	TextLink,
} from './styled'

const footerPages = [
	{
		title: 'Help Center',
		path: '/',
	},
	{
		title: 'Terms of Use',
		path: '/',
	},
	{
		title: 'Privacy Policy',
		path: '/',
	},
	{
		title: 'Contact Us',
		path: '/',
	},
]

const FooterBody = ({ page = '' }: { page?: string }) => {
	const forLogin = page === 'login'

	return (
		<FooterSection sx={!forLogin ? { gap: '41px' } : {}}>
			<AddressSection
				sx={!forLogin ? { justifyContent: 'flex-start' } : {}}
			>
				{map(footerPages, (pg, i) => (
					<AddressButton key={`address-${i}`}>
						{pg.title}
					</AddressButton>
				))}
			</AddressSection>
			<FooterText sx={!forLogin ? { textAlign: 'left' } : {}}>
				By using this website, you understand the information being
				presented is provided for informational purposes only and agree
				to our <TextLink>Terms of Use </TextLink>
				and <TextLink>Privacy Policy </TextLink> . Navable
				relies on information from various sources believed to be
				reliable, including partners and third parties, but cannot
				guarantee the accuracy and completeness of that information.
				Nothing in this website should be construed as an offer,
				recommendation, or solicitation to buy or sell any security.
				Additionally, Navable does not provide tax advice and
				investors are encouraged to consult with their personal tax
				advisors.
			</FooterText>
			<FooterText sx={!forLogin ? { textAlign: 'left' } : {}}>
				© 2023 Navable Inc. All rights reserved.
			</FooterText>
		</FooterSection>
	)
}
export default FooterBody

FooterBody.defaultProps = {
	page: '',
}
