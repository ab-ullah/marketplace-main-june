import {FunctionComponent} from "react";
import {useParams} from "react-router-dom";
import {StyledLink} from "./styles";
import {ArrowBack} from '@material-ui/icons';

interface BackToApplicationProps {
  className?: string;
}


const BackToApplication: FunctionComponent<BackToApplicationProps> = ({className}) => {
  const {externalId, company} = useParams<{ externalId: string, company: string }>();
  const applicationUrl = `/${company}/funds/${externalId}/application`


  return <StyledLink to={applicationUrl} className={className}>
    <ArrowBack/> Back to Application Overview
  </StyledLink>
};


export default BackToApplication;
