import { FunctionComponent } from 'react'
import { Logo, LoaderContainer } from './styles'
import NavableLogo from "../../assets/images/navable-icon.png";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NavableLoaderProps {}

const NavableLoader: FunctionComponent<NavableLoaderProps> = () => (
	<LoaderContainer>
		<Logo src={NavableLogo} />
		<div>Loading...</div>
	</LoaderContainer>
)

export default NavableLoader
