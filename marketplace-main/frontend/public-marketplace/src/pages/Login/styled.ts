import { styled } from '@mui/system'

const PageCont = styled('div')(({ theme }) => ({
	backgroundColor: theme.palette.primary.dark,
	minHeight: '100vh',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
}))

const PageBody = styled('div')(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	maxWidth: '713px',
	margin: '48px 16px',
	gap: '41px',
	[theme.breakpoints.down('sm')]: {
		gap: '81px',
	},
}))

const InviteCard = styled('div')({
	padding: '64px 0px',
	borderRadius: '20px',
	textAlign: 'center',
	backgroundColor: 'white',
	maxHeight: '409px',
})

const CardImg = styled('img')({
	width: '221px',
	marginBottom: '20px'
})

const Title = styled('h1')(({ theme }) => ({
	fontWeight: 700,
	fontSize: '32px',
	lineHeight: '38px',
	color: '#111111',
	[theme.breakpoints.down('sm')]: {
		fontSize: '24px',
		lineHeight: '29px',
	},
}))

export { PageCont, PageBody, InviteCard, CardImg, Title }
