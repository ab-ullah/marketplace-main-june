import { styled } from '@mui/system'

const Cont = styled('div')({})

const Tile = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	textAlign: 'center',
	alignItems: 'center',
	// padding: '106px 0',
	height: '390px',
	width: '100%',

	background: '#FFFFFF',
	border: '1px solid #CFD8DC',
	borderRadius: '16px',
})

const Title = styled('h1')({
	margin: '0px',
	fontWeight: '700',
	fontSize: '40px',
	lineHeight: '60px',
})

const Description = styled('h3')({
	margin: '0px',
	fontWeight: '400',
	fontSize: '24px',
	lineHeight: '36px',
})

export { Cont, Tile, Title, Description }
