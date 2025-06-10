/* eslint-disable import/prefer-default-export */
import { styled } from '@mui/system'

const Cont = styled('div')({
	width: '50%',
	display: 'flex',
	gap: '21px',
})

const ProfilePic = styled('img')({
	width: '100%',
	maxWidth: '80px',
	height: '80px',
	borderRadius: '50%',
})

const DesignationSection = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	padding: '8px 0px 0px',
})

const Name = styled('p')({
	fontWeight: '700',
	fontSize: '18px',
	lineHeight: '24px',
	margin: '0px',
})

const Designation = styled('h3')({
	fontWeight: '500',
	fontSize: '16px',
	lineHeight: '24px',
	margin: '0px',
})

export { Cont, ProfilePic, DesignationSection, Name, Designation }
