/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const TopRow = styled('div')({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	paddingBottom: '18px',
})

const Title = styled('h1')({
	margin: '0px',
	fontWeight: '700',
	fontSize: '40px',
	lineHeight: '60px',
})

export { Title, TopRow }
