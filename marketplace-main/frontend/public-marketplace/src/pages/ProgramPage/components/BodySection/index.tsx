import SponsoredCard from 'pages/HomePage/components/FundCardLayout/components/SponsoredCard'
import { Text, Cont, LeftSection, RightSection } from './styled'

const BodySection = () => (
	<Cont>
		<LeftSection>
			<Text>
				Lorem ipsum, lorem ipsum lorem ipsum lorem ipsum lorem ipsum
				lorem ipsum lorem ipsum lorem ipsum.
			</Text>
			<Text>
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
				lorem ipsum.
			</Text>
			<Text>
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.
			</Text>
			<Text>
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum
				lorem ipsum lorem ipsum lorem ipsum lorem ipsum
			</Text>
		</LeftSection>
		<RightSection>
			<SponsoredCard
				sx={{
					padding: '32px 24px',
					boxShadow:
						'0px 76px 74px rgba(0, 0, 0, 0.03), 0px 16px 16px rgba(0, 0, 0, 0.0178832), 0px 5px 5px rgba(0, 0, 0, 0.0121168)',
					maxWidth: '369px',
				}}
			/>
		</RightSection>
	</Cont>
)

export default BodySection
