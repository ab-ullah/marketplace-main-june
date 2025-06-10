import { styled } from '@mui/system'

const CustomButton = styled('button')({
	fontWeight: 700,
	lineHeight: '25px',
	borderRadius: '70px',
	border: 'none',
	cursor: 'pointer',
	'&:disabled': {
		cursor: 'not-allowed',
		opacity: 0.5,
	},

	// padding: '16px 16px 16px 24px !important',
	fontSize: '20px',
	// whiteSpace: 'nowrap',
	// textOverflow: 'ellipsis',
	// display: 'inline-block',
	// overflow: 'hidden',

	display: 'flex',
	alignItems: 'center',
	gap: '5px',
	justifyContent: 'center',
})

const Positioned = styled('div')({
	display: 'flex',
	width: '100%',
	height: 'fit-content',
	overflow: 'hidden',
})

export { CustomButton, Positioned }
