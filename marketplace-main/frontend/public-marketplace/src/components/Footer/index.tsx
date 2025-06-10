import { useLocation } from 'react-router-dom'
import FooterBody from './FooterBody'
import { PageCont } from './styled'

const dissAllowedPages =['login']

const Footer = () => {
	const { pathname } = useLocation()
	const hide = pathname.split('/').some(item => dissAllowedPages.includes(item))
	// eslint-disable-next-line react/jsx-no-useless-fragment
	if (hide) return <></>
	return (
		<PageCont>
			<FooterBody />
		</PageCont>
	)
}

export default Footer
