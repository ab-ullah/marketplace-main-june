import React, {FunctionComponent} from 'react';
import {useParams} from "react-router-dom";
import CapitalCallDetail from "./components/CapitalCallDetail";


interface CapitalCallPageProps {
}


const CapitalCall: FunctionComponent<CapitalCallPageProps> = () => {
  const {uuid} = useParams<{ uuid: string }>();

  return <>
    <CapitalCallDetail uuid={uuid}/>
  </>
};

export default CapitalCall;
