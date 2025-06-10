/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	display: 'flex',
	justifyContent: 'center',
})

const Body = styled('div')({
	maxWidth: '996px',
	width: '100%',
	boxSizing: 'border-box',
	display: 'flex',
	justifyContent: 'space-between',
	padding: '48px',
	gap: '51px',
})

const Title = styled('h1')({
	margin: '0px',
	fontWeight: '700',
	fontSize: '40px',
	lineHeight: '60px',
})

const Question = styled('h1')({
	margin: '0px',
	fontWeight: '400',
	fontSize: '20px',
	lineHeight: '30px',
})

const Answer = styled('p')({
	margin: '0px',
	fontWeight: '500',
	fontSize: '16px',
	lineHeight: '24px',
})

export { Cont, Body, Title, Question, Answer }
