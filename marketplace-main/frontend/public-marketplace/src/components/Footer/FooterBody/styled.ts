import { styled } from '@mui/system'

const FooterSection = styled('div')(({ theme }) => ({
	gap: '12px',
	display: 'flex',
	flexDirection: 'column',
	[theme.breakpoints.down('sm')]: {
		gap: '36px',
	},
}))

const AddressSection = styled('div')(({ theme }) => ({
	display: 'flex',
	justifyContent: 'center',
	gap: '33px',
	[theme.breakpoints.down('sm')]: {
		flexDirection: 'column',
		alignItems: 'flex-start',
		gap: '24px',
	},
}))

const AddressButton = styled('button')({
	fontWeight: 700,
	fontSize: '14px',
	lineHeight: '18px',
	color: 'white',
	background: 'none',
	border: 'none',
})

const FooterText = styled('p')(({ theme }) => ({
	color: '#FFFFFF',
	fontWeight: 400,
	fontSize: '12px',
	lineHeight: '15px',
	textAlign: 'center',
	margin: '0px',
	[theme.breakpoints.down('sm')]: {
		textAlign: 'left',
	},
}))

const TextLink = styled('span')({
	fontWeight: 700,
	textDecoration: 'underline',
	cursor: 'pointer',
})

export { FooterSection, AddressSection, AddressButton, FooterText, TextLink }
