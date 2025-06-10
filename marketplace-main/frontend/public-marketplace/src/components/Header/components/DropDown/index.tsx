import { useState, MouseEvent, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Button from 'components/Button/ThemeButton'
import { getUserInfo } from 'services/User'
import { UserInfo } from 'interfaces/User'
import { startCase } from 'lodash'
import {
	UserName,
	DropDownButton,
	SecondSectionText,
	ThirdSectionText,
} from './styled'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { INVESTOR_APP_IFRAME_ID } from 'components/Header/constants'

const DropDown = () => {
	const { isLoading, isAuthenticated, loginWithRedirect, logout } = useAuth0()
	const token = axios.defaults.headers.common.Authorization
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const [user, setUser] = useState<UserInfo | null>(null)
	const {company} = useParams()
	const open = Boolean(anchorEl)
	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget)
	}
	const handleClose = () => {
		setAnchorEl(null)
	}

	const handleLogout = () => {
		const ORIGIN = process.env.REACT_APP_INVESTOR_URL;
		// @ts-ignore
		const iframeWindow = document.getElementById(INVESTOR_APP_IFRAME_ID)?.contentWindow;
		iframeWindow.postMessage('clear-investor-app-local-storage', ORIGIN);
		logout(company ? {returnTo: `${window.location.origin}/${company}`}: { returnTo: window.location.origin })
		// logout({returnTo: encodeURIComponent(window.location.origin + '/sidecar')})
		handleClose()
	}

	const createInvestorAppIframeAndLogout = () => {
		if(document.getElementById(INVESTOR_APP_IFRAME_ID)) return;
		const iframe = document.createElement('iframe');
		iframe.style.display = 'none';
		iframe.setAttribute('id', INVESTOR_APP_IFRAME_ID);
		iframe.onload = handleLogout
		const investorAppUrl = process.env.REACT_APP_INVESTOR_URL;
		investorAppUrl && iframe.setAttribute('src', investorAppUrl);
		document.body.appendChild(iframe);
	}


	const handleUserInfo = async () => {
		const res = await getUserInfo()
		if (res.success) {
			setUser(res.data)
		}
	}

	useEffect(() => {
		if (isAuthenticated && token) {
			handleUserInfo()
		}
	}, [isAuthenticated,token])

	if (isLoading) return <div />
	if (!isAuthenticated)
		return (
			<Button size='sm' position='right' onClick={() => loginWithRedirect(
				{
					appState: {
						returnTo: window.location.pathname
					}
				}
			)}>
				Login
			</Button>
		)

	return (
		<>
			<DropDownButton onClick={handleClick}>
				<UserName>{startCase(user?.display_name)}</UserName>
				<ExpandMoreIcon />
			</DropDownButton>
			<Menu
				id='basic-menu'
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				onClick={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: 'visible',
						filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
						mt: 1.5,
						'& .MuiAvatar-root': {
							width: 32,
							height: 32,
							ml: -0.5,
							mr: 1,
						},
						'&:before': {
							content: '""',
							display: 'block',
							position: 'absolute',
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: 'background.paper',
							transform: 'translateY(-50%) rotate(45deg)',
							zIndex: 0,
						},
					},
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				{['User guide', 'Sidecar help center'].map(text => (
					<MenuItem key={text}>
						<SecondSectionText>{text}</SecondSectionText>
					</MenuItem>
				))}
				<Divider />
				{['Log out'].map(text => (
					<MenuItem key={text}>
						<ThirdSectionText onClick={createInvestorAppIframeAndLogout}>
							{text}
						</ThirdSectionText>
					</MenuItem>
				))}
			</Menu>
		</>
	)
}

export default DropDown
