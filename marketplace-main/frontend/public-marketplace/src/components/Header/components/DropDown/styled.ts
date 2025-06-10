import { styled } from '@mui/system'
import {
	SecondSectionText,
	ThirdSectionText,
	FirstSectionText,
} from '../Drawer/styled'

const UserName = styled(FirstSectionText)({
	paddingTop: '6px',
	letterSpacing: '0.02em',
	color: '#020203',
	marginRight: '5px',
	margin: '0px',
})

const DropDownButton = styled('button')({
	display: 'flex',
	alignItems: 'center',
	background: 'none',
	border: 'none',
	height: '27px',
})

export { UserName, DropDownButton, SecondSectionText, ThirdSectionText }
