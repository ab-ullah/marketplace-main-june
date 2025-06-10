/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const ImageIconDiv = styled('div')({
	padding: '15px',
	display: 'flex',
	alignItems: 'center',
	gap: '5px',
	p: {
		fontWeight: '500',
		fontSize: '16px',
		lineHeight: '24px',
		color: '#000000',
		textDecoration: 'none',
		margin: '0px',
	},
	'.pointer': {
		cursor: 'pointer',
	},
})

export { ImageIconDiv }
