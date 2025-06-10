/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const DocumentUploadContainer = styled('div')({
	flex: '1',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	padding: '20px',
	borderWidth: '2px',
	borderRadius: '2px',
	borderStyle: 'dashed',
	color: '#bdbdbd',
	outline: 'none',
	transition: 'border .24s ease-in-out',
	marginTop: '40px',
	background: '#ffffff',
	borderColor: '#C1CEE9',

	p: {
		fontFamily: 'Quicksand',
		fontStyle: 'normal',
		fontWeight: '500',
		fontSize: '16px',
		lineHeight: '24px',
		color: '#2E86DE !important',
	},

	'.select-button': {
		background: '#FFFFFF',
		border: '1px dashed #C1CEE9',
		boxSizing: 'border-box',
		borderRadius: '10px',
		fontFamily: 'Quicksand',
		fontStyle: 'normal',
		fontWeight: 'bold',
		fontSize: '16px',
		lineHeight: '20px',
		color: '#2E86DE',
		padding: '8px 18px',
		'&::hover': {
			background: '#FFFFFF',
			border: '1px dashed #C1CEE9',
			color: '#2E86DE',
		},
	},
})

export { DocumentUploadContainer }
