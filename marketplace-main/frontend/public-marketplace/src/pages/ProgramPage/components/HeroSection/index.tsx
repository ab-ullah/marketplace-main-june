import Button from 'components/Button/ThemeButton'
import { Banner, Title, Description } from './styled'

const HeroSection = () => (
	<div>
		<Banner>
			<Title>Lorem Ipsum Lorem Ipsum</Title>
			<Description>
				Providing you with investment opportunities today. For tomorrow.
			</Description>
			<Button
				size='lg'
				position='left'
				solo
				contSx={{ marginTop: '19px' }}
				btnStyle={{
					fontSize: '24px',
					lineHeight: '30px',
				}}
			>
				Start investing now
			</Button>
		</Banner>
	</div>
)

export default HeroSection
