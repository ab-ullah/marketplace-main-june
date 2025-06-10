import { FC, useEffect, useState } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import map from 'lodash/map'
import Button from 'components/Button/ThemeButton'
import { PageWrapper } from 'components/Page'
import { Card } from './components'
import { Description, PageCont, Title } from './styled'

const tacData = [
	{
		name: 'card1',
		text: 'I declare that I meet the Financial Conduct Authority’s definition of one of the following:',
		points: [
			'a certified high net worth investor within the meaning of COBS 4.7.9 (1)(a) R',
			'a self-certified sophisticated investor within the meaning of COBS 4.7.9 (1)(c) R',
			'a certified sophisticated investor within the meaning of COBS 4.7.9 (1)(b) R',
			'a restricted investor within the meaning of COBS 4.7.10 R',
		],
		confirmationText:
			'I confirm, that I fit one of the investor descriptions listed above ',
	},
	{
		name: 'card2',
		text: 'We are collecting some of your information in order to comply with the GDPR regulations in your country.',
		confirmationText:
			'I agree that some of my data will be securily saved in accordance with GDPR compliance',
	},
]

const Consent: FC<unknown> = () => {
	const [checkBoxes, setCheckBoxes] = useState<Record<string, unknown>>({})
	const [searchParams] = useSearchParams()
	const { company } = useParams()
	const navigate = useNavigate()

	useEffect(() => {
		const checkBoxList: Record<string, unknown> = {}
		tacData.forEach(dat => {
			checkBoxList[dat.name as keyof typeof checkBoxList] = false
		})
		setCheckBoxes(checkBoxList)
	}, [tacData])

	const handleChange = (checked: boolean, name: string) => {
		setCheckBoxes((prev: Record<string, unknown>) => ({
			...prev,
			[name]: checked,
		}))
	}

	const handleClick = () => {
		localStorage.setItem('consentSubmitted', 'true')
		const redirectTo = searchParams.get('redirectTo')
		navigate(redirectTo || `/${company}`)
	}

	const allChecked = () =>
		Object.values(checkBoxes).every(value => value === true)

	return (
		<PageWrapper>
			<PageCont>
				<Title>Review and confirm</Title>
				<Description>
					Both confirmations are required to proceed to our investment
					platform
				</Description>

				{map(tacData, (data, i) => (
					<Card
						key={`card-${i}`}
						data={data}
						handleChange={handleChange}
						checkBoxes={checkBoxes}
					/>
				))}

				<Button
					solo
					disabled={!allChecked()}
					onClick={handleClick}
					size='md'
					position='right'
				>
					Confirm and Submit
				</Button>
			</PageCont>
		</PageWrapper>
	)
}

export default Consent
