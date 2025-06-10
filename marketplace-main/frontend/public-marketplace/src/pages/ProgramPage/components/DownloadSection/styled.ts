import { styled } from '@mui/system'

const Cont = styled('div')({
	display: 'flex',
	justifyContent: 'center',
})

const Tile = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'center',
	padding: '48px',
	maxWidth: '996px',
	width: '100%',

	background: '#FFFFFF',
	border: '1px solid #CFD8DC',
	borderRadius: '16px',
})

const TileText = styled('h1')({
	fontWeight: '400',
	fontSize: '24px',
	lineHeight: '36px',
})

export { Tile, Cont, TileText }
