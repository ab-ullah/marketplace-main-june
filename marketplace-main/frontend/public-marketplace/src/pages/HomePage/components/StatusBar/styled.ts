import { styled } from '@mui/system'

const BarCont = styled('div')(({ theme }) => ({
	display: 'flex',
	background: '#FFF',
	width: 'fit-content',
	borderRadius: '24px',
	border: '1px solid #C1CEE9',

	[theme.breakpoints.down('md')]: {
		flexDirection: 'column',
		width: '100%',
		borderRadius: '8px',
	},
}))
const BarBtn = styled('div')(({ theme }) => ({
	padding: '6px 14px',
	display: 'flex',
	justifyContent: 'center',
	alignContent: 'center',
	alignItems: 'center',
	fontWeight: '500',
	fontSize: '16px',
	lineHeight: '22px',
	letterSpacing: '0.02em',
	color: '#020203',
	cursor: 'pointer',
	[theme.breakpoints.down('md')]: {
		borderBottom: '1px #C1CEE9 solid',
	},
}))
const BarCounter = styled('span')({
	fontWeight: '500',
	fontSize: '22px',
	lineHeight: '32px',
	color: '#020203',
	marginRight: '10px',
	marginLeft: '6px',
})

export { BarCont, BarBtn, BarCounter }
