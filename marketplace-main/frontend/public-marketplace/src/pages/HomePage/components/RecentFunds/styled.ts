/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	// backgroundColor: theme.palette.secondary.light,
	backgroundColor: '#F5F7F8',
	border: '1px solid #CFD8DC',
	borderRadius: '16px',
	padding: '55px',
	position: 'relative',
	marginTop: '64px',
})

const Title = styled('h4')({
	fontWeight: '700',
	fontSize: '48px',
	lineHeight: '72px',
	marginTop: '0px',
	marginBottom: '22px',
})

export { Cont, Title }
