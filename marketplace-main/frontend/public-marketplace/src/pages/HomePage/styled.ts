import { Grid } from '@mui/material'
import { styled } from '@mui/system'
import { defaultPagePadding } from 'constants/global'

const TopRow = styled(Grid)({
	display: 'flex',
	alignItems: 'center',
	alignContent: 'center',
	flexDirection: 'row',
	justifyContent: 'space-between',
	padding: defaultPagePadding,
})

const WelcomeBackText = styled('h1')({
	fontFamily: "'Inter'",
	fontStyle: 'normal',
	fontWeight: '700',
	fontSize: '48px',
	lineHeight: '72px',
	color: '#020203',
	margin: '0px',
})

export const NO_DATA_TEXT_DIV = styled('div')`
  font-family: 'Inter';
  font-style: normal;
  font-size: 14px;
  line-height: 29px;
  color: rgba(2, 2, 3, 0.9);
  margin-bottom: 16px;
`

export { TopRow, WelcomeBackText }
