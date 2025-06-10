/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Circle = styled('div')(({ theme }) => ({
	backgroundColor: theme.palette.primary.main,
	color: 'white',
	width: '80px',
	height: '80px',
	borderRadius: '100px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	position: 'absolute',
	top: '-40px',
	cursor: 'pointer',

	left: 'calc(50% - 27.5px)',
}))

export { Circle }
