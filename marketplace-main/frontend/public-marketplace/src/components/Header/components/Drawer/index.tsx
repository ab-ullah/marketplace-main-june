import { useState, useEffect, KeyboardEvent, MouseEvent, Fragment } from 'react'
import { Pivot as Hamburger } from 'hamburger-react'
import { useAuth0 } from '@auth0/auth0-react'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import { useTheme } from '@mui/material/styles'
import {
	FirstSectionText,
	SecondSectionText,
	ThirdSectionText,
	SelectedBarLeft,
	ListBox,
} from './styled'
import { useParams } from 'react-router-dom'

const CustomDrawer = ({
	sendToParent,
	currentPage,
}: {
	sendToParent: (e: boolean | ((prevState: boolean) => boolean)) => void
	currentPage: string
}) => {
	const [open, setOpen] = useState(false)
	const theme = useTheme()
	const {company} = useParams()
	const primaryColor = theme.palette.primary.main
	const { isLoading, logout } = useAuth0()

	useEffect(() => {
		sendToParent(open)

		return () => {
			sendToParent(false)
		}
	}, [open])

	const toggleDrawer =
		(_open: boolean) => (event: KeyboardEvent | MouseEvent) => {
			if (
				event.type === 'keydown' &&
				((event as KeyboardEvent).key === 'Tab' ||
					(event as KeyboardEvent).key === 'Shift')
			) {
				return
			}

			setOpen(_open)
		}

	const handleLogout = () => {
		logout(company ? {returnTo: `${window.location.origin}/${company}`}: { returnTo: window.location.origin })
		// logout({returnTo: encodeURIComponent(window.location.origin + '/' + company)})
		toggleDrawer(false)
	}

	const list = () => (
		<ListBox
			role='presentation'
			onClick={toggleDrawer(false)}
			onKeyDown={toggleDrawer(false)}
		>
			<List>
				{['Home', 'My Portfolio', 'Support'].map(text => (
					<ListItem key={text} disablePadding>
						<ListItemButton>
							{currentPage === text && <SelectedBarLeft />}
							<FirstSectionText>{text}</FirstSectionText>
						</ListItemButton>
					</ListItem>
				))}
			</List>
			<Divider />
			<List>
				{['User guide', 'Sidecar help center'].map(text => (
					<ListItem key={text} disablePadding>
						<ListItemButton>
							<SecondSectionText>{text}</SecondSectionText>
						</ListItemButton>
					</ListItem>
				))}
			</List>

			<Divider />
			<List>
				{['Log out'].map(text => (
					<ListItem key={text} disablePadding>
						<ListItemButton onClick={handleLogout}>
							<ThirdSectionText>{text}</ThirdSectionText>
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</ListBox>
	)
	if (isLoading) return <div style={{ height: '48px', width: '48px' }} />
	return (
		<div>
			<Fragment key='header-drawer'>
				<Hamburger
					color={primaryColor}
					toggled={open}
					toggle={setOpen}
					size={25}
				/>
				<Drawer anchor='top' open={open} onClose={toggleDrawer(false)}>
					{list()}
				</Drawer>
			</Fragment>
		</div>
	)
}

export default CustomDrawer
