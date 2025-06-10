/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	maxWidth: '735px',
	margin: '60px auto',
})

const Icon = styled('img')({
	width: '53px',
	height: 'auto',
	marginBottom: '32px',
})

const Title = styled('h1')({
	fontWeight: '700',
	fontSize: '32px',
	lineHeight: '34px',
	margin: '0px',
	marginBottom: '16px',
})

const Description = styled('p')({
	fontWeight: '400',
	fontSize: '16px',
	lineHeight: '19px',
	margin: '0px',
	marginBottom: '32px',
	maxWidth: '567px',
})

const BtnsSection = styled('div')({
	display: 'flex',
	flexDirection: 'row',
	gap: '16px',
})

const NotEligibleSection = styled('div')({
	width: '100%'
})

export { Cont, Icon, Title, Description, BtnsSection, NotEligibleSection }
