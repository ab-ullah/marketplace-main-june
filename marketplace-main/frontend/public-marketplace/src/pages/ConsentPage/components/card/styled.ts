import { styled } from '@mui/system'

const CardCont = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	padding: '36px',
	marginBottom: '36px',
	gap: '16px',
	width: '-webkit-fill-available',
	background: '#FFFFFF',
	borderRadius: '16px',
	fontSize: '16px',
})

const CardText = styled('p')({
	margin: '0px',
	textAlign: 'left',
})

const List = styled('ul')({
	margin: '0px',
	paddingLeft: '20px',
})

const ListItem = styled('li')({
	textAlign: 'left',
})

export { CardCont, CardText, List, ListItem }
