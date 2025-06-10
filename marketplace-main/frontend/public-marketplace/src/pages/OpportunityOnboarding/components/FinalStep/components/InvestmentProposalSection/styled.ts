/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Description = styled('p')({
	fontWeight: '500',
	fontSize: '14px',
	lineHeight: '18px',
	letterSpacing: '0.02em',
	margin: '0px',
})

const Cont = styled('div')({
	width: '100%',
	display: 'flex',
})

const Left = styled('div')({
	width: '50%',
	display: 'flex',
	flexDirection: 'column',
	gap: '32px',
})

const Right = styled('div')({
	width: '50%',
})

const ButtonWrapper = styled('div')({
	display: 'flex',
	justifyContent: 'space-between',
	width: '100%'
})

export { Description, Cont, Left, Right, ButtonWrapper  }
