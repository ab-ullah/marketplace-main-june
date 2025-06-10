/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Card = styled('div')({
	background: '#EBF3FB',
	borderRadius: '8px',
	padding: '24px',
	width: '100%',
	maxWidth: '316px',
	marginLeft: 'auto',
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	gap: '12px',
	marginTop: '18px',
})

const ListSection = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	padding: '0px 0px 12px',
	width: '268px',
	height: '72px',
	borderBottom: '2px solid #FFFFFF',
})

const List = styled('div')({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	width: '100%',
	minHeight: '30px',
})

const ListAmount = styled('h4')({
	fontWeight: '400',
	fontSize: '20px',
	lineHeight: '30px',
	margin: '0px',
})

const TotalAmout = styled('h4')({
	fontWeight: '400',
	fontSize: '24px',
	lineHeight: '36px',
	margin: '0px',
})

const Text = styled('p')({
	fontWeight: '500',
	fontSize: '14px',
	lineHeight: '18px',
	letterSpacing: '0.02em',
	textTransform: 'uppercase',
	margin: '0px',
})

export { Card, List, Text, ListAmount, TotalAmout, ListSection }
