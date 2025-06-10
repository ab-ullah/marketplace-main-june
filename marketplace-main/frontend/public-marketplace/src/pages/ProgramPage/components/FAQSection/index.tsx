import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { map } from 'lodash'
import { Body, Cont, Title, Question, Answer } from './styled'

const faqList = [
	{
		question: 'What’s the best thing about Switzerland?',
		answer: "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
	},
	{
		question: 'Lorem Ipsum ',
		answer: "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
	},
	{
		question: 'Lorem Ipsum ',
		answer: "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
	},
	{
		question: 'Lorem Ipsum ',
		answer: "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
	},
	{
		question: 'Lorem Ipsum ',
		answer: "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
	},
]

const FAQSection = () => (
	<Cont>
		<Body>
			<Title>FAQ</Title>
			<div>
				{map(faqList, (faq, i) => (
					<Accordion
						key={`faq-${i}`}
						sx={{
							background: 'transparent',
							border: 'none',
							boxShadow: 'none',
						}}
					>
						<AccordionSummary
							expandIcon={
								<ExpandMoreIcon
									sx={{ color: 'primary.main' }}
								/>
							}
							aria-controls='panel1a-content'
							id='panel1a-header'
							sx={{
								justifyContent: 'space-between !important',
							}}
						>
							<Question>{faq.question}</Question>
						</AccordionSummary>
						<AccordionDetails>
							<Answer>{faq.answer}</Answer>
						</AccordionDetails>
					</Accordion>
				))}
			</div>
		</Body>
	</Cont>
)

export default FAQSection
