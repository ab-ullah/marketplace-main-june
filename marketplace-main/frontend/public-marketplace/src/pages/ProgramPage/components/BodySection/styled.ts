/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'
import { defaultVPadding } from 'constants/global'

const Cont = styled('div')({
	display: 'flex',
	justifyContent: 'space-between',
	padding: `${defaultVPadding} 0px`,
})

const LeftSection = styled('div')({
	maxWidth: '950px',
})

const RightSection = styled('div')({
	padding: '49px 32px',
	paddingTop: '0px',
})

const Text = styled('p')({
	fontWeight: '500',
	fontSize: '16px',
	lineHeight: '24px',
	letterSpacing: '0.02em',
})

export { Text, Cont, LeftSection, RightSection }
