import Loader from 'components/Loader'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageCont } from './styled'

const NotFound = () => {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const code = searchParams.get('code')
	const companyName = localStorage.getItem('companyName')

	useEffect(() => {
		if (!code) {
			if (companyName) {
				navigate(`/${companyName}`)
			}
		}
	}, [])

	return (
		<PageCont>
			{code ? (
				<Loader />
			) : (
				<div>
					<h1 style={{ textAlign: 'center' }}>Invalid Link</h1>
					<h2 style={{ textAlign: 'center' }}>
						Please visit the link provided by the company
					</h2>
				</div>
			)}
		</PageCont>
	)
}

export default NotFound
