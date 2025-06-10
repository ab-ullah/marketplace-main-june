import { FunctionComponent } from "react";
import { ContactWrapper, H1, H2, H3 } from "./styles";

interface ContactSectionProps {}

const ContactSection: FunctionComponent<ContactSectionProps> = () => {
  return (
    <ContactWrapper>
      <H2>Questions about the investment program offerings? </H2>
      <H3 className={'mt-3'}>Contact support</H3>
      <H2>
        <a href="mailto:support@navable.com">
        support@navable.com
        </a>
      </H2>
    </ContactWrapper>
  );
};

export default ContactSection;
