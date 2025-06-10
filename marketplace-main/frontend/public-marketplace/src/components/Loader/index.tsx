import CircularProgress from '@mui/material/CircularProgress'
import { Cont } from './styled'

const Loader = ({ sx }: any) => (
	<Cont sx={sx}>
		<CircularProgress size={40} />
	</Cont>
)

export default Loader
