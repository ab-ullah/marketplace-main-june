import { FunctionComponent } from "react";
import Logo from "../../assets/images/cycle-logo.svg";
import { FooterContainer } from "./styles";

interface FooterProps {}

const FooterSection: FunctionComponent<FooterProps> = () => {
  return (
    <FooterContainer>
      <img className="logo" src={Logo} alt="sidecar-logo" />
      <ul className="links">
        <li>Help Center</li>
        <li>Terms of Use</li>
        <li>Cookie Policy</li>
        <li>Privacy Policy</li>
        <li>Contact Us</li>
      </ul>
      <p className="content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
        tincidunt nunc faucibus est pulvinar, a luctus nisl mollis. Proin congue
        diam pulvinar, iaculis arcu sit amet, iaculis purus. Curabitur lacus
        lacus, pulvinar quis dapibus ut, elementum et felis. Curabitur sit amet
        viverra nulla. Cras pellentesque blandit massa eget luctus. Fusce tempor
        at arcu non tristique. Donec commodo tincidunt nisl, sed laoreet enim
        porttitor sed. Proin lobortis sed tellus vel ornare. Aliquam tempor elit
        sollicitudin, rhoncus nisi vitae, tristique enim. Nunc consectetur lacus
        ut felis finibus, at facilisis ex volutpat.
      </p>
      <p className="copyright">
        &copy; 2023 Sidecar Financial Inc. All rights reserved.
      </p>
    </FooterContainer>
  );
};

export default FooterSection;
