import { styled } from '@mui/system'

const CardCont = styled('div')({
	backgroundColor: '#F9F9F9',
	padding: '48px',
	border: '1px solid #CFD8DC',
	borderRadius: '8px',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '16px',
})

const Text = styled('p')({
	fontWeight: '700',
	fontSize: '14px',
	lineHeight: '18px',
	textAlign: 'center',
	letterSpacing: '0.02em',
})

const CompanyLogo = styled('img')({
	height: '36px',
})

export { CardCont, Text, CompanyLogo }
