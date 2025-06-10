import { useEffect, FC as ComponentType, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import Loader from 'components/Loader'
import axios from 'axios'
import mixpanel from 'mixpanel-browser'
import { getUserInfo } from 'services/User'
import { get } from 'lodash'
import { getCompaniesList, logMixPanelEvent } from 'utils/mixpanel'

const ProtectedComponent = <P extends object>({
	Component,
	// children,
	...args
}: {
	Component: ComponentType<P>
	// children: ReactNode
	args?: Record<string, JSX.Element>
}) => {
	const navigate = useNavigate()
	const {company} =useParams()
	const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0()
	const [accessToken, setAccessToken] = useState<string | null>(null)
	const { pathname } = useLocation()
	const consentSubmitted = localStorage.getItem('consentSubmitted')
	const [tokenUpdated,setTokenUpdated]=useState(false)

	const updateAxiosToken = async (retry: boolean) => {
		try {
			const token = await getAccessTokenSilently()
			// eslint-disable-next-line no-console
			console.log('toke  call =====>>>>>')
			axios.defaults.headers.common.Authorization = `Bearer ${token}`
			setTokenUpdated(true)
		} catch (e) {
			// eslint-disable-next-line no-console
			console.log(e)
			if (retry) {
				setTimeout(() => updateAxiosToken(false), 3000)
			}
			else{
				setTokenUpdated(true)
			}
		}
	}

	useEffect(() => {
		updateAxiosToken(true)
		if(process.env.REACT_APP_MIX_PANEL_API_KEY)
      		mixpanel.init(process.env.REACT_APP_MIX_PANEL_API_KEY, {debug: true});
	}, [])

	const logLoginEvent = async () => {
		const res = await getUserInfo()
		if (res.success) {
			const {companyNames, companySlugs} = getCompaniesList(get(res, 'data.company_users', []));
			mixpanel.identify(get(res, 'data.email'));
			mixpanel.track('New Login', {
				companies: companyNames,
				companySlugs,
				app: 'Public Marketplace'
			})
        	localStorage.removeItem('newLogin');
			localStorage.setItem('userInfo', JSON.stringify(res.data))
		}
	}

	useEffect(() => {
		const isNewLogin = localStorage.getItem('newLogin');
		if(isNewLogin && accessToken){
			logLoginEvent()
		}
	}, [accessToken])

	useEffect(() => {
		logMixPanelEvent(pathname);
	  }, [pathname]);

	if (isLoading || !tokenUpdated) {
		return <Loader />
	}
	if (isAuthenticated) {
		if (pathname.toLowerCase().includes('consent') && consentSubmitted) {
			navigate(`/${company}`)
		} else if (
			!pathname.toLowerCase().includes('consent') &&
			!consentSubmitted
		) {
			navigate(`/${company}/consent?redirectTo=${pathname}`)
		}
		// return <Component {...(args as P)}>{children}</Component>
		return <Component {...(args as P)} />
	}

	navigate(`/${company}/login`)
	return <Loader />
}

export default ProtectedComponent

ProtectedComponent.defaultProps = {
	args: {},
}
