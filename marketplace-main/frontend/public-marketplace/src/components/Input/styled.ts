/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: '6px',
})
const Title = styled('p')({
	fontWeight: '500',
	fontSize: '16px',
	lineHeight: '24px',
	margin: '0px',
})

const HelperText = styled('p')({
	fontWeight: '500',
	fontSize: '12px',
	lineHeight: '15px',
	letterSpacing: '0.02em',
	color: '#2E86DE',
	margin: '0px',
	marginTop: '-6px',
})

const ErrorText = styled(HelperText)({
	color: 'red',
})

const HintText = styled('p')({
	fontWeight: '400',
	fontSize: '14px',
	lineHeight: '20px',
	color: '#556987',
	margin: '0px',
})

const TextInput = styled('input')({
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

export { Cont, Title, TextInput, HelperText, HintText, ErrorText }
