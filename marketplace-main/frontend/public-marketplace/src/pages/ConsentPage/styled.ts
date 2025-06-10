import { styled } from '@mui/system'

const PageCont = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	padding: '50px',
	minHeight: 'calc(100vh - 500px)',
})
const Title = styled('p')({
	fontWeight: 600,
	fontSize: '24px',
	lineHeight: '30px',
	margin: '0px',
})

const Description = styled('p')({
	fontWeight: 400,
	fontSize: '16px',
	lineHeight: '24px',
	marginTop: '0px',
})

export { PageCont, Title, Description }
