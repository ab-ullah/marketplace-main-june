import { styled } from '@mui/system'
import { ELEMENTS_DEFAULT_PADDING as padding } from './constants'
import { FirstSectionText } from './components/Drawer/styled'

const PageCont = styled('div')(({ theme }) => ({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	background: '#FFFFFF',
	boxShadow:
		'0px 76px 74px rgba(0, 0, 0, 0.03), 0px 16px 16px rgba(0, 0, 0, 0.0178832), 0px 5px 5px rgba(0, 0, 0, 0.0121168)',
	borderRadius: '0px 0px 16px 16px',
	position: 'fixed',
	left: 0,
	right: 0,
	top: 0,
	zIndex: 1201,
	[theme.breakpoints.down('sm')]: {},
}))

const MidPadding = styled('div')(({ theme }) => ({
	cursor: 'pointer',
	borderBottom: '4px solid transparent',
	paddingTop: padding.desktop.y,
	paddingBottom: padding.desktop.y,
	[theme.breakpoints.down('sm')]: {
		paddingTop: padding.mobile.y,
		paddingBottom: padding.mobile.y,
	},
}))

const LeftPadding = styled(MidPadding)(({ theme }) => ({
	paddingLeft: padding.desktop.x,
	[theme.breakpoints.down('sm')]: {
		paddingLeft: padding.mobile.x,
	},
}))

const RightPadding = styled(MidPadding)(({ theme }) => ({
	paddingRight: padding.desktop.x,
	[theme.breakpoints.down('sm')]: {
		paddingRight: padding.mobile.x,
	},
}))


const LogoCont =styled('div')(({ theme }) => ({
	height: '43px',
	width: '160px',
	paddingLeft: padding.desktop.x,
	paddingRight: '38px',
	paddingTop: '21px',
	paddingBottom: '21px',
	[theme.breakpoints.down('sm')]: {
		paddingLeft: padding.mobile.x,
		paddingTop: '14px',
		paddingBottom: '14px',
		height: '29px',
		width: '108px',
	},
}))

const HeaderLogo = styled('img')({
	width:'inherit',
	height:'inherit'
})

const FlexRow = styled('div')({
	display: 'flex',
	alignItems: 'center',
})

const HeaderText = styled(FirstSectionText)({
	margin: '0px',
})

export {
	PageCont,
	LogoCont,
	HeaderLogo,
	LeftPadding,
	RightPadding,
	MidPadding,
	FlexRow,
	HeaderText,
}
