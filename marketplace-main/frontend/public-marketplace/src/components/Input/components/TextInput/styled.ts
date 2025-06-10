/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	position: 'relative',
	display: 'flex',
	alignItems: 'center',
})

const PrefixText = styled('span')({
	boxSizing: 'border-box',
	fontWeight: 400,
	fontSize: '16px',
	lineHeight: '24px',
	position: 'absolute',
	height: '100%',
	display: 'flex',
	alignItems: 'center',
	padding: '11px',
	background: '#ECEFF1',
	border: '1px solid #D5DAE1',
	boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
	borderRadius: '8px 0px 0px 8px',
	maxWidth: '60px',
	overflow: 'hidden',
})

const StyledInput = styled('input')({
	boxSizing: 'border-box',
	border: '1px solid #D5DAE1',
	boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
	borderRadius: '8px',
	padding: '13px 14px',
	width: '100%',
	'&:focus-visible': {
		outline: 'none',
	},
})

export { Cont, PrefixText, StyledInput }
