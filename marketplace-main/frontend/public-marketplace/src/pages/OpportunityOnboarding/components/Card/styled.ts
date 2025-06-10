/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Wrapper = styled('div')({
	width: '100%',
	maxWidth: '984px',
	margin: '100px auto',
})

const Cont = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	padding: '36px',
	gap: '32px',
	// width: '984px',
	// height: '616px',
	background: '#FFFFFF',
	borderRadius: '16px',
})

const Title = styled('h1')({
	fontWeight: '600',
	fontSize: '24px',
	lineHeight: '29px',
})

export { Cont, Title, Wrapper }
