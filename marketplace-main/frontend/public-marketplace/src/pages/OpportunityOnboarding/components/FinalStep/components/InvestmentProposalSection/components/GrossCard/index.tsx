import { isNumStr } from 'utils/helpers'
import { formatCurrency } from 'utils/currency'
import { Card, List, Text, ListAmount, ListSection, TotalAmout } from './styled'

interface GrossCardProps {
	equity: string
	leverage: number
	currency: string
	offerLeverage: boolean
}


const GrossCard = (props: GrossCardProps) => {
	const { equity, leverage, currency, offerLeverage } = props
	const equityNum = isNumStr(equity) ? parseFloat(equity) : 0
	// const leverageValues = leverage.split(':')
	// const leverageRatio =
	// 	parseInt(leverageValues[0], 10) / parseInt(leverageValues[1], 10)

	// const totalGross = (equityNum * leverageRatio + equityNum).toFixed(2)
	const totalGross = offerLeverage ? (equityNum * leverage + equityNum).toFixed(2) : equityNum.toFixed(2)

	return (
		<Card>
			<ListSection>
				<List>
					<Text>Equity</Text>
					<ListAmount>
						{formatCurrency(equityNum.toFixed(2).toString())}
					</ListAmount>
				</List>
				{
					offerLeverage && <List>
					<Text>Leverage</Text>
					<ListAmount>
						{formatCurrency(
							(leverage * equityNum).toFixed(2).toString(),
						)}
					</ListAmount>
				</List>
				}
			</ListSection>
			<List sx={{ height: '36px' }}>
				<Text>Total</Text>
				<TotalAmout>
					{formatCurrency(
						totalGross.toString(),
						currency,
					)}
				</TotalAmout>
			</List>
		</Card>
	)
}
export default GrossCard
