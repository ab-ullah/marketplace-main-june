/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Title = styled('h1')({
	fontWeight: '700',
	fontSize: '48px',
	lineHeight: '72px',
	margin: '0px',
})

const Description = styled('div')({
	fontWeight: '400',
	fontSize: '20px',
	lineHeight: '32px',
	margin: '0px',
	h1: {
		margin: '0px',
	},
	h2: {
		margin: '0px',
	},
	h3: {
		margin: '0px',
	},
	p: {
		margin: '0px',
	},
})

const BackText = styled('p')({
	fontWeight: '700',
	fontSize: '18px',
	lineHeight: '24px',
	margin: '0px',
})

const BackNav = styled('div')(({ theme }) => ({
	display: 'flex',
	gap: '8px',
	color: theme.palette.primary.main,
	cursor: 'pointer',
}))

export { Title, Description, BackText, BackNav }
