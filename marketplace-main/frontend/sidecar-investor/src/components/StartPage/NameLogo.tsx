import { FunctionComponent } from "react";
import LassaleLogo from "../../components/Logo";
import {LinkStyle,NameLogoDiv} from './styles'


interface NameLogoProps {
  logo: string;
  name: string;
}

const NameLogo: FunctionComponent<NameLogoProps> = ({ logo, name}) => {
  return (
    <NameLogoDiv>
     <div style={{marginBottom:'4px'}}>
      <LassaleLogo logo={logo}/>
      </div>
      <LinkStyle>{name} ↗</LinkStyle>
    </NameLogoDiv>
  );
};

export default NameLogo;
