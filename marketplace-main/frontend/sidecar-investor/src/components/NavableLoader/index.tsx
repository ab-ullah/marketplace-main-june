import { FunctionComponent } from "react";
import { Logo, LoaderContainer } from './styles';
import NavableLogo from "../../assets/images/navable-icon.png";

interface NavableLoaderProps {}

const NavableLoader: FunctionComponent<NavableLoaderProps> = () => {
  return (
    <LoaderContainer>
      <Logo src={NavableLogo} />
      <div>Loading...</div>
    </LoaderContainer>
  );
}

export default NavableLoader;
