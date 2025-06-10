import { Box, styled } from '@mui/system'

const FirstSectionText = styled('span')({
	fontWeight: '700',
	fontSize: '18px',
	lineHeight: '24px',
	padding: '8px 16px',
	marginLeft: '10px',
})
const SecondSectionText = styled(FirstSectionText)({
	fontSize: '16px',
})

const ThirdSectionText = styled(SecondSectionText)({
	color: '#393940',
})

const SelectedBarLeft = styled('span')(({ theme }) => ({
	border: `2px solid ${theme.palette.primary.main}`,
	height: '0px',
	width: '25px',
	position: 'absolute',
	left: '0',
	borderRadius: '0px 100px 100px 0px',
	backgroundColor: theme.palette.primary.main,
}))

const ListBox = styled(Box)(({ theme }) => ({
	width: 'auto',
	marginTop: '111px',
	background: 'white',
	boxShadow:
		'0px 76px 74px rgba(0, 0, 0, 0.03), 0px 16px 16px rgba(0, 0, 0, 0.0178832), 0px 5px 5px rgba(0, 0, 0, 0.0121168)',
	borderRadius: '0px 0px 16px 16px',
	[theme.breakpoints.down('sm')]: {
		marginTop: '76px',
	},
}))

export {
	FirstSectionText,
	SecondSectionText,
	ThirdSectionText,
	SelectedBarLeft,
	ListBox,
}
