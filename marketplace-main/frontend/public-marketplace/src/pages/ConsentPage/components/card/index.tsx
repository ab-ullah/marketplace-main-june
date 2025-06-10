import map from 'lodash/map'
import { Checkbox, FormControlLabel } from '@mui/material'
import { CardCont, CardText, List, ListItem } from './styled'

interface CardData {
	name: string
	text: string
	points?: string[]
	confirmationText: string
}

interface TACsCardProps {
	data: CardData
	handleChange: (_checked: boolean, _name: string) => void
	checkBoxes: Record<string, unknown>
}

const Card = ({ data, handleChange, checkBoxes }: TACsCardProps) => (
	<CardCont>
		<CardText>{data.text}</CardText>
		{data.points && (
			<List>
				{map(data.points, (point, i) => (
					<ListItem key={`point-${i}`}>{point}</ListItem>
				))}
			</List>
		)}
		<FormControlLabel
			sx={{ alignItems: 'flex-start' }}
			control={
				<Checkbox
					onChange={e => handleChange(e.target.checked, data.name)}
					checked={checkBoxes[data.name] === true}
					inputProps={{ 'aria-label': 'controlled' }}
					sx={{
						color: 'primary.main',
						'&.Mui-checked': {
							color: 'primary.main',
						},
						borderRadius: 7,
						paddingTop: '0px',
					}}
				/>
			}
			label={data.confirmationText}
		/>
	</CardCont>
)

export default Card
