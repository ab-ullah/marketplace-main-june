import { ScrollRefType } from 'interfaces/common/refs'
import { OptionTypeBase } from 'react-select'
import { Cont, Row, LabelCell, ValueCell } from './styled'

interface HighlightsSectionProps {
	scrollRef: ScrollRefType
	stats: OptionTypeBase[]
}

const HighlightsSection = ({ scrollRef, stats }: HighlightsSectionProps) => (
	<Cont ref={scrollRef}>
		{stats?.map((dat, i) => (
			<Row
				key={`row-${dat.label}`}
				sx={i === stats.length - 1 ? { borderBottom: 'none' } : {}}
			>
				<LabelCell sx={{ color: '#607D8B' }}>{dat.label}</LabelCell>
				<ValueCell dangerouslySetInnerHTML={{ __html: dat.value }} />
			</Row>
		))}
	</Cont>
)

export default HighlightsSection
