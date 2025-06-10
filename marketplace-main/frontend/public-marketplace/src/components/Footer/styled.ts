/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const PageCont = styled('div')(({ theme }) => ({
	backgroundColor: theme.palette.primary.dark,
	borderRadius: '32px 32px 0px 0px',
	paddingBottom: '77px',
	paddingTop: '47px',
	paddingLeft: '56px',
	paddingRight: '56px',
	marginTop: '60px',
}))

export { PageCont }
