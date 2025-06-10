/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Banner = styled('div')({
	background:
		'linear-gradient(180deg, rgba(25, 132, 66, 0.212) 0%, rgba(0, 0, 0, 0.4) 86.47%), url("https://images.unsplash.com/photo-1565356388813-5a047b9f5807?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80")',
	borderRadius: '0px 0px 16px 16px',
	width: '100%',
	height: '573px',
	backgroundSize: 'cover',
	padding: '35px 55px',
	boxSizing: 'border-box',

	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'flex-end',
})

const Title = styled('h1')({
	fontWeight: '700',
	fontSize: '40px',
	lineHeight: '60px',
	color: 'white',
	margin: '0px',
})

const Description = styled(Title)({
	fontWeight: '400',
	fontSize: '24px',
	lineHeight: '36px',
})

export { Banner, Title, Description }
