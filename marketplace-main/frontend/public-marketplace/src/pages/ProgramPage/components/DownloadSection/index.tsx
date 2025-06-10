import Button from 'components/Button/ThemeButton'
import DownloadIcon from '@mui/icons-material/Download'
import { Tile, Cont, TileText } from './styled'

const DownloadSection = () => (
	<Cont>
		<Tile>
			<TileText>Download our complete detailed guide</TileText>
			<Button variant='outlined' MuiIcon={DownloadIcon}>
				Download the Guide
			</Button>
		</Tile>
	</Cont>
)

export default DownloadSection
