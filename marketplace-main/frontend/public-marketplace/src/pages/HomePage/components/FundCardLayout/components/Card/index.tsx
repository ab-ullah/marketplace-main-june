import GlobeIcon from 'assets/images/IconGlobe.png'
import WalletIcon from 'assets/images/IconWallet.png'
import CalendarIcon from 'assets/images/IconCalendar.png'
import Button from 'components/Button/ThemeButton'
import ErrorOutlineSharpIcon from '@mui/icons-material/ErrorOutlineSharp'
import { IOpportunity } from 'interfaces/Opportunities'
import { formatCurrency } from 'utils/currency'
import { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { map } from 'lodash'
import useWindowDimensions from 'utils/WindowDimensions'
import {INVESTOR_ORIGIN, INVESTOR_URL_PREFIX} from 'constants/routes'
import {
	CardCont,
	Header,
	CardLogo,
	Cell,
	Title,
	TagsCont,
	TagsBody,
	SmallIcon,
	DescriptionBlock,
	BodyText,
	BtnsSection,
	AccBtnsSection,
	FirstSection,
	SecondSection,
	DetailTitle,
	DetailDescription,
	DetailCard,
	ColGap5,
	RowGap10,
	CommitmentAmount,
	CommitmentSection,
	CommitmentText,
} from './styled'
import AccordionWrapper from './components/AccordionWrapper'
import { advisorSelectedHexParam } from 'utils/helpers'

interface CardProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	opportunity: IOpportunity | Record<string, never> | any
	hideLearnMore?: boolean
	hideDescription?: boolean
}

const defaultValue = '--'

const Card: FC<CardProps> = ({
	opportunity,
	hideLearnMore,
	hideDescription,
}) => {
	const navigate = useNavigate()
	const {
		logo,
		company_logo,
		investment_period,
		name,
		investment_description,
		focus_region,
		type,
		close_applications,
		external_id,
		accept_applications,
		currency,
		minimum_investment,
		target_irr,
		strategy,
		risk_profile,
		tags,
		has_active_application,
	} = opportunity
	const { width } = useWindowDimensions()
	const { company } =useParams()
	const isSM = () => width < 600
	const nextLine = () => width < 630

	const viewDetails = () => {
		navigate(
			`/${company}/opportunity/${external_id}/detail`,
		)
	}

	const goToOnboarding = () => {
		window.open(
			`${INVESTOR_ORIGIN}/${company}/${INVESTOR_URL_PREFIX}/funds/${external_id}/onboarding?mp=true${advisorSelectedHexParam()}`,
			'_self')
	}

	const goToApplication = () => {
		window.open(
			`${INVESTOR_ORIGIN}/${company}/${INVESTOR_URL_PREFIX}/funds/${external_id}/application?mp=true${advisorSelectedHexParam()}`,
			'_self')
	}
	
	return (
		<CardCont>
			<FirstSection>
				<Header>
					{logo && <CardLogo src={logo} alt='logo' />}
					{!logo && (
						<CardLogo src={company_logo} alt='company_logo' />
					)}
					{/* <Cell>{investment_period}</Cell> */}
				</Header>
				<ColGap5>
					<Title className={'cursor-pointer'} onClick={viewDetails}>{name}</Title>
					<TagsCont>
						<TagsBody>
							{map(tags, tag => (
								<Cell
									// eslint-disable-next-line react/no-array-index-key
									key={tag.slug}
									sx={{
										backgroundColor: 'cell.background',
									}}
								>
									{tag.name}
								</Cell>
							))}
						</TagsBody>
					</TagsCont>
					{!hideDescription && (
						<DescriptionBlock
							dangerouslySetInnerHTML={{
								__html: investment_description,
							}}
						/>
					)}
				</ColGap5>
				<ColGap5>
					<RowGap10>
						<SmallIcon src={GlobeIcon} alt='reigon' />
						<BodyText> {focus_region}</BodyText>
					</RowGap10>
					<RowGap10>
						<SmallIcon src={WalletIcon} alt='wallet' />
						<BodyText> {type}</BodyText>
					</RowGap10>
					<RowGap10>
						<SmallIcon src={CalendarIcon} alt='wallet' />
						<BodyText> {investment_period}</BodyText>
					</RowGap10>
				</ColGap5>
				{!close_applications && !isSM() && (
					<BtnsSection>
						<Button
							solo={hideLearnMore}
							full={hideLearnMore}
							size={width < 1418 ? 'sm' : undefined}
							onClick={has_active_application ? goToApplication : goToOnboarding}
							disabled={!accept_applications}
						>
							{has_active_application ? 'View Application' : 'Apply now'}
						</Button>
						{!hideLearnMore && (
							<Button
								variant='secondary'
								size={width < 1418 ? 'sm' : undefined}
								onClick={viewDetails}
							>
								Learn more
							</Button>
						)}
					</BtnsSection>
				)}
			</FirstSection>

			{close_applications ? (
				<CommitmentSection
					sx={
						nextLine()
							? {
									flexDirection: 'column',
									alignItems: 'flex-start',
							  }
							: {}
					}
				>
					<CommitmentText>Total Commitment</CommitmentText>
					<CommitmentAmount>
						{formatCurrency('120000', currency.code)}
					</CommitmentAmount>
				</CommitmentSection>
			) : (
				<AccordionWrapper selector={external_id} useAccordion={isSM()}>
					<SecondSection
						container
						rowSpacing={1}
						columnSpacing={{ xs: 1, sm: 2, md: 3 }}
						sx={
							isSM()
								? {}
								: { borderTop: 1, borderColor: 'divider' }
						}
					>

						<DetailCard item sm={6} xs={12}>
							<DetailTitle>
								{target_irr || defaultValue}%
							</DetailTitle>
							<DetailDescription>
								Target IRR{' '}
								<ErrorOutlineSharpIcon
									sx={{ fontSize: '14px' }}
								/>
							</DetailDescription>
						</DetailCard>

						<DetailCard item sm={6} xs={12}>
							<DetailTitle>
								{strategy || defaultValue}
							</DetailTitle>
							<DetailDescription>Strategy</DetailDescription>
						</DetailCard>

						<DetailCard item sm={12} xs={12}>
							<DetailTitle>
								{currency.code}{' '}
								{formatCurrency(minimum_investment) || 0}
							</DetailTitle>
							<DetailDescription>
								Minimum Investment
							</DetailDescription>
						</DetailCard>
					</SecondSection>
					{isSM() && (
						<AccBtnsSection>
							<Button
								solo
								onClick={has_active_application ? goToApplication : goToOnboarding}
								disabled={!accept_applications}
								full
							>
								{has_active_application ? 'View Application' : 'Apply now'}
							</Button>
							{!hideLearnMore && (
								<Button solo variant='secondary' full>
									Learn more
								</Button>
							)}
						</AccBtnsSection>
					)}
				</AccordionWrapper>
			)}
		</CardCont>
	)
}

export default Card

Card.defaultProps = {
	hideLearnMore: false,
	hideDescription: false,
}
