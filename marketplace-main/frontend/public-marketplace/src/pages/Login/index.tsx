import Button from 'components/Button/ThemeButton'
import { useAuth0 } from '@auth0/auth0-react'
import Logo from 'assets/images/InfluentLogo.svg'
import FooterBody from 'components/Footer/FooterBody'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from 'components/Loader'
import { get } from 'lodash';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react'
import { CardImg, InviteCard, PageBody, PageCont, Title } from './styled'

const Login = () => {
	const {
		loginWithRedirect,
		isAuthenticated,
		isLoading,
		getAccessTokenSilently,
	} = useAuth0()
	const [loading, setLoading] = useState(true)
	const theme = useTheme()
	const companyLogo = get(theme,'components.logo')
	const navigate = useNavigate()
	const {company}= useParams()

	const getToken = async (retry: boolean) => {
		try {
			const token = await getAccessTokenSilently()
			return { tokenExists: Boolean(token), token }
		} catch (error) {
			if (retry) {
				setTimeout(() => getToken(false), 3000)
			}
			return { tokenExists: false, token: 'not found' }
		}
	}

	const handleRedirection = async (
		_isLoading: boolean,
		_isAuthenticated: boolean,
	) => {
		const { tokenExists } = await getToken(true)
		if (_isLoading) {
			setLoading(true)
		} else if (_isAuthenticated || tokenExists) {
			navigate(`/${company}`)
			setLoading(true)
		} else {
			setLoading(false)
		}
	}

	useEffect(() => {
		localStorage.setItem("companyName", company as string);
		handleRedirection(isLoading, isAuthenticated)
	}, [isLoading, isAuthenticated])

	if (loading) return <Loader />
	return (
		<PageCont>
			<PageBody>
				<InviteCard>
					<CardImg src={companyLogo || Logo} alt='logo' />
					{/* <Title>
						You were invited to some investment opportunities by Ely
						Place
					</Title> */}
					<Button
						solo
						onClick={() => {
							localStorage.setItem('newLogin', 'true');
							loginWithRedirect(
								{
									appState: {
										returnTo: window.location.pathname
									}
								}
							)
						}}
					>
						Sign up or Log in
					</Button>
				</InviteCard>
				<FooterBody page='login' />
			</PageBody>
		</PageCont>
	)
}

export default Login
