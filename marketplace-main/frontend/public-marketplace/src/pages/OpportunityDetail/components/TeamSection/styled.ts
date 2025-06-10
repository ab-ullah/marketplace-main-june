/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Title = styled('p')({
	fontWeight: '700',
	fontSize: '36px',
	lineHeight: '45px',
	marginTop: '0px',
})

const Column = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: '24px',
})

export { Title, Column }
