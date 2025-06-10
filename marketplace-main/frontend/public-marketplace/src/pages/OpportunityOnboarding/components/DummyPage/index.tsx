import Button from 'components/Button/ThemeButton'

const DummyPage = ({
	handleNext,
	handleBack,
}: {
	handleNext: () => void
	handleBack: () => void
}) => (
	<>
		<Button
			onClick={handleBack}
			solo
			position='left'
			variant='outlined'
			size='sm'
		>
			Back
		</Button>
		<h3> This page is under development</h3>
		<Button solo position='right' onClick={handleNext}>
			Next
		</Button>
	</>
)

export default DummyPage
