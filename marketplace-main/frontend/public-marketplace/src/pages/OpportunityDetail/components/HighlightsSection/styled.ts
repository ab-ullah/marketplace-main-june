/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	padding: '0px',
	background: '#FFFFFF',
	border: '1px solid #CFD8DC',
	borderRadius: '16px',
})

const Row = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-start',
	padding: '24px 31px',
	borderBottom: '1px solid #D5DAE1',
	gap: '16px',
	width: '100%',
})

const LabelCell = styled('h3')({
	fontWeight: 500,
	fontSize: '16px',
	lineHeight: '24px',
	width: '50%',
	margin: '0px',
})

const ValueCell = styled('div')({
	fontWeight: 500,
	fontSize: '16px',
	lineHeight: '24px',
	width: '50%',
	margin: '0px',
	h1: {
		margin: '0px',
	},
	h2: {
		margin: '0px',
	},
	h3: {
		margin: '0px',
	},
	p: {
		margin: '0px',
	},
})

export { Cont, Row, LabelCell, ValueCell }
