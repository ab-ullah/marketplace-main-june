/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	padding: '16px',
	gap: '32px',
	background: '#FFFFFF',
	border: '1px solid #C1CEE9',
	boxShadow:
		'0px 76px 74px rgba(0, 0, 0, 0.03), 0px 16px 16px rgba(0, 0, 0, 0.0178832), 0px 5px 5px rgba(0, 0, 0, 0.0121168)',
	borderRadius: '8px',
	height: '100%',
})

const ColView = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	padding: '0px',
})

const RowView = styled('div')({
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	alignItems: 'flex-end',
	padding: '0px',
	width: '100%',
})

const Title = styled('h3')({
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
	margin: '0px',
})

const StatusCell = styled('div')({
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'center',
	alignItems: 'center',
	padding: '6px 16px',
	background: 'rgba(236, 161, 6, 0.4)',
	borderRadius: '27px',
	fontWeight: '700 !important',
})

export { Cont, ColView, RowView, Title, Text, StatusCell }
