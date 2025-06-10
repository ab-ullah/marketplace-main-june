/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: '32px',
})

const Banner = styled('div')({
	borderRadius: '16px',
	width: '100%',
	height: '400px',
})

const Description = styled('div')({
	fontWeight: '500',
	fontSize: '16px',
	lineHeight: '24px',
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

export { Banner, Description, Cont }
