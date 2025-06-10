import { ScrollRefType } from 'interfaces/common/refs'
import { Banner, Description, Cont } from './styled'

interface OverviewSectionProps {
	scrollRef: ScrollRefType
	description: string
	bannerImage: string
}

const defaultBanner =
	'https://images.unsplash.com/photo-1565356388813-5a047b9f5807?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'

const OverviewSection = ({
	scrollRef,
	description,
	bannerImage,
}: OverviewSectionProps) => (
	<Cont ref={scrollRef}>
		<Banner
			sx={{
				background: `linear-gradient(180deg, rgba(25, 132, 66, 0.212) 0%, rgba(0, 0, 0, 0.4) 86.47%), url(${
					bannerImage || defaultBanner
				})`,
				backgroundSize: 'cover',
			}}
		/>
		<Description dangerouslySetInnerHTML={{ __html: description }} />
	</Cont>
)

export default OverviewSection
