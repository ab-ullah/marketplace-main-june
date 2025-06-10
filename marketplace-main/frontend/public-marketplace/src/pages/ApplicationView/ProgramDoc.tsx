import { FunctionComponent } from 'react';
import isNil from "lodash/isNil";
import { useParams } from "react-router-dom";
import { Params } from "../TaxForms/interfaces";
import {useFetchProgramDocsQuery} from "../../api/rtkQuery/fundsApi";
import ProgramDocForm from "../ProgramDoc/Form";
import { getUnavailableSectionMesage } from "../../constants/applicationView";
import { SubTitle } from "./styles";

interface IProgramDoc {
  isApplicationView?: boolean;
  callbackSubmitPOA: () => void;
}

const ProgramDoc: FunctionComponent<IProgramDoc> = ({ isApplicationView, callbackSubmitPOA }) => {
  const { externalId } = useParams<any>();
  const { data:  programDocuments } = useFetchProgramDocsQuery({externalId, skipRquiredOnce: !isApplicationView}, {
    skip: !externalId,
  });
  
  return <>
    <SubTitle>Program Documents</SubTitle>
    {isNil(programDocuments) ? (<p>{getUnavailableSectionMesage('Program Documents')}</p>) : (
      <ProgramDocForm isApplicationView={isApplicationView} callbackSubmitPOA={callbackSubmitPOA} />
    )}
  </>
}

export default ProgramDoc;
