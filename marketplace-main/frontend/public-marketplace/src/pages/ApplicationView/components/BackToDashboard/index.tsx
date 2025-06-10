import React, {FunctionComponent} from "react";
import arrowLeft from "assets/images/arrow-left-icon.svg"
import {BackLink} from "./styles";
import {useNavigate} from "react-router";
import { useParams } from "react-router-dom";


interface BackToDashboardProps {
}

const BackToDashboard: FunctionComponent<BackToDashboardProps> = () => {
  const navigate = useNavigate()
  const {company}= useParams()

  const onClick = () => navigate(`/${company}`)

  return (
    <BackLink onClick={onClick}>

      <img src={arrowLeft} alt=''/>
      Back to Dashboard
    </BackLink>
  );
};

export default BackToDashboard;
