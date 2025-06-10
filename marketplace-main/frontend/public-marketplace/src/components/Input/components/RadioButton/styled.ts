/* eslint-disable import/prefer-default-export */
import FormControlLabel from '@mui/material/FormControlLabel'
import { styled } from '@mui/system'

const CustomOption = styled(FormControlLabel)({
	padding: '10px 16px',
	boxSizing: 'border-box',
	border: '1px solid #ECEFF1',
	borderRadius: '8px',
	alignItems: 'flex-start',
	marginLeft: 0,
	marginRight: 0
})

export { CustomOption }
