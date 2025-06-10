import { ReactNode, useState, SyntheticEvent } from 'react'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { AccordionTitle } from './styled'

const AccordionWrapper = ({
	children,
	useAccordion,
	selector,
}: {
	children: ReactNode
	useAccordion: boolean
	selector: string
}) => {
	const [expanded, setExpanded] = useState<string | false>(false)

	const handleChange =
		(panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false)
		}
	return useAccordion ? (
		<Accordion
			expanded={expanded === selector}
			onChange={handleChange(selector)}
			sx={{
				'&::before': {
					height: '0px',
				},
			}}
		>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
				aria-controls='panel1a-content'
				id='panel1a-header'
				sx={{
					backgroundColor: 'secondary.light',
					borderTop: '1px solid #CFD8DC',
					color: 'primary.main',
				}}
			>
				<AccordionTitle>
					{expanded === selector ? 'Hide details' : 'More details'}{' '}
				</AccordionTitle>
			</AccordionSummary>
			<AccordionDetails
				sx={{
					padding: '0px',
					backgroundColor: 'secondary.light',
				}}
			>
				{children}
			</AccordionDetails>
		</Accordion>
	) : (
		<> {children}</>
	)
}

export default AccordionWrapper
