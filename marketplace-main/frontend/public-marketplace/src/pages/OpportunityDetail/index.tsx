import { useEffect, useRef, useState } from 'react'
import { PageWrapper } from 'components/Page'
import { useNavigate, useParams } from 'react-router-dom'
import { map } from 'lodash'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import { defaultPagePadding } from 'constants/global'
import { IOpportunity } from 'interfaces/Opportunities'
import { getFund, getFundDocuments } from 'services/Fund'
import Card from 'pages/HomePage/components/FundCardLayout/components/Card'
import Loader from 'components/Loader'
import OverviewSection from './components/OverviewSection'
import HighlightsSection from './components/HighlightsSection'
// import TeamSection from './components/TeamSection'
import DocumentsSection from './components/DocumentsSection'
import RecentlyPostedFunds from './components/RecentlyPostedFunds'
import { Description, Title, BackNav, BackText } from './styled'


interface IDoc {
	title: string
	document_id: string
}

const OpportunityDetail = () => {
	const { externalId, company } = useParams()
	const navigate = useNavigate()
	const ref0 = useRef<HTMLDivElement>(null)
	const ref1 = useRef<HTMLDivElement>(null)
	const ref2 = useRef<HTMLDivElement>(null)
	const ref3 = useRef<HTMLDivElement>(null)
	const [opportunity, setOpportunity] = useState<IOpportunity>()
	const [files, setFiles] = useState<IDoc[]>([])

	const getTabOptions = () => {
		const { length: fileCount = 0 } = files || [];
		const { length: statCount = 0 } = opportunity?.stats_json || [];
		const options = ['Overview', ...(fileCount ? ['Documents'] : []), ...(statCount ? ['Highlights'] : [])];
		return options;
	  };

	const a11yProps = (index: number) => ({
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
		sx: {
			fontWeight: 700,
			fontSize: '18px',
			textTransform: 'none',
			lineHeight: '24px',
		},
	})

	const scrollTo =(sectionRef:any)=>{
        window.scrollBy(0, (sectionRef.current?.offsetTop as number) - 120)
    }

    const handleClick = (newValue: string) => {
        switch (newValue) {
            case 'Overview':
                scrollTo(ref0)
                break
            case 'Highlights':
                scrollTo(ref1)
                break
            case 'Team':
                scrollTo(ref2)
                break
            case 'Documents':
                scrollTo(ref3)
                break
            default:
                break
        }
    }

	const fetchFundDetails = async () => {
		const res = await getFund(externalId)
		if (res.success) {
			setOpportunity(res.data)
		}
	}

	const handleDocFetch = async () => {
		const res = await getFundDocuments(opportunity?.external_id)
		if (res.success) {
			setFiles(res.data.map((file: { document: IDoc }) => file.document))
		}
	}

	useEffect(() => {
		fetchFundDetails()
		window.scrollTo(0, 0)
	}, [])

	useEffect(()=>{
		if(opportunity?.external_id) handleDocFetch()
	},[opportunity])

	return (
		<PageWrapper>
			<div
				style={{
					padding: defaultPagePadding,
					display: 'flex',
					gap: '60px',
				}}
			>
				{opportunity ? (
					<>
						<div style={{ width: '66%' }}>
							<BackNav onClick={() => navigate(`/${company}`)}>
								<NavigateBeforeIcon />
								<BackText>Back to all opportunities</BackText>
							</BackNav>
							<Title>{opportunity?.name}</Title>
							<Description
								dangerouslySetInnerHTML={{
									__html: opportunity.short_description,
								}}
							/>
							<Box
								sx={{
									borderBottom: 1,
									borderColor: 'divider',
									marginTop: '39px',
								}}
							>
								<Tabs
									value={0}
									aria-label='Opportunity details tabs'
								>
									{map(getTabOptions(), (opt, i) => (
										<Tab
											key={`tab-${opt}`}
											onClick={() => handleClick(opt)}
											label={opt}
											{...a11yProps(i)}
										/>
									))}
								</Tabs>
							</Box>
							<Box
								sx={{
									p: 3,
									gap: '32px',
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<OverviewSection
									scrollRef={ref0}
									description={opportunity.long_description}
									bannerImage={opportunity.banner_image}
								/>
								{opportunity.stats_json?.length > 0 && (
									<HighlightsSection
										scrollRef={ref1}
										stats={opportunity.stats_json}
									/>
								)}
								{/* <TeamSection
									scrollRef={ref2}
									managers={opportunity.managers}
								/> */}
								<DocumentsSection
									scrollRef={ref3}
									files={files}
								/>
							</Box>
						</div>
						<div style={{ width: '34%' }}>
							<Card
								key={`card-${opportunity.id}`}
								opportunity={opportunity}
								hideLearnMore
								hideDescription
							/>
						</div>
					</>
				) : (
					<Loader />
				)}
			</div>
			<RecentlyPostedFunds />
		</PageWrapper>
	)
}

export default OpportunityDetail
