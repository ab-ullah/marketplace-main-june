// import { useParams } from 'react-router-dom'

import { PageWrapper } from 'components/Page'
import { defaultHPadding } from 'constants/global'
import HeroSection from './components/HeroSection'
import BodySection from './components/BodySection'
import RecentOpportunities from './components/RecentOpportunities'
import DownloadSection from './components/DownloadSection'
import FAQSection from './components/FAQSection'
import StartInvestingCard from './components/StartInvestingCard'

const ProgramPage = () => (
	// const { id = 1 } = useParams()

	// console.log(id)
	<PageWrapper>
		<div style={{ minHeight: '80vh', padding: `0px ${defaultHPadding}` }}>
			<HeroSection />
			<BodySection />
			<RecentOpportunities />
			<DownloadSection />
			<FAQSection />
			<StartInvestingCard />
		</div>
	</PageWrapper>
)

export default ProgramPage
