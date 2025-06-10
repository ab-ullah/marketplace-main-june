import Button from 'components/Button/ThemeButton'
import { Cont, Description, Tile, Title } from './styled'

const StartInvestingCard = () => (
	<Cont>
		<Tile>
			<Title>Recently posted opportunities</Title>
			<Description>
				Providing you with investment opportunities today. For tomorrow.
			</Description>
			<Button
				size='lg'
				contSx={{ marginTop: '24px' }}
				btnStyle={{
					fontSize: '24px',
					lineHeight: '30px',
				}}
				solo
			>
				Start investing now
			</Button>
		</Tile>
	</Cont>
)

export default StartInvestingCard
