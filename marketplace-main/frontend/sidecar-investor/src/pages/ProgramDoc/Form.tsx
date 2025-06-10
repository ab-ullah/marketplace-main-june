import {useState, FunctionComponent, useEffect} from 'react';
import {useParams} from "react-router-dom";
import DOMPurify from 'dompurify';
import map from "lodash/map";
import get from "lodash/get";
import {
  useFetchProgramDocsQuery, useGetApplicationStatusQuery
} from "../../api/rtkQuery/fundsApi";
import {Params} from "../TaxForms/interfaces";
import {useAppSelector} from "../../app/hooks";
import {InnerFieldContainer} from '../KnowYourCustomer/styles';
import {selectKYCRecord} from "../KnowYourCustomer/selectors";
import WetSignDoc from "./components/WetSignDoc";
import ApproveDocs from "./components/ApproveDoc";
import RequireSignDoc from "./components/RequireSignDoc";
import {PROGRAM_DOCS} from "../../constants/commentModules";
import CommentWrapper from "../../components/CommentWrapper";
import NavableLoader from "../../components/NavableLoader";
import {IApplicationStatus} from "../../interfaces/application";

interface IProgramDocs {
  isApplicationView?: boolean;
  callbackSubmitPOA?: () => void;
}

const ProgramDocs: FunctionComponent<IProgramDocs> = ({isApplicationView}) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const {externalId} = useParams<Params>();
  const {data: programDocuments, refetch, isLoading} = useFetchProgramDocsQuery({externalId, skipRquiredOnce: !isApplicationView}, {
    skip: !externalId,
  });
  const { refetch: refetchAppStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(
    externalId, {
      skip: !externalId,
    }
  );
  const {commentsByRecord} = useAppSelector(selectKYCRecord) || {};

  const getSignedComments = (document_id: number, docId: number, signedId: string) => {
    const commentsOfThisRecord = get(commentsByRecord, `${PROGRAM_DOCS}.${document_id}.${docId}.${signedId}`);
    return commentsOfThisRecord;
  };

  const getAcknowledgeComments = (document_id: number, companyDocId: number) => {
    const commentsOfThisRecord = get(commentsByRecord, `${PROGRAM_DOCS}.${document_id}.${companyDocId}`);
    return commentsOfThisRecord && commentsOfThisRecord[''];
  };

  const onSubmit = () => {
    refetch()
    refetchAppStatus()
  }

  useEffect(()=>{
    refetchAppStatus()
  },[])

  if (isDisabled || isLoading) return <NavableLoader/>

  return (
    <InnerFieldContainer className={isDisabled ? "disabled-div" : ""}>
      {map(programDocuments, ({id, company_document, envelope_id, is_acknowledged, signed_document, completed}) => (
        <div key={id}>
          <h5 className={'mt-3 mb-2'}>{company_document.name}</h5>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(company_document.description)}} />
          {company_document.require_signature && company_document.require_wet_signature && (
            <>
              <WetSignDoc id={id} signedDoc={signed_document} doc={company_document} callbackSubmit={onSubmit}/>
              {map(getSignedComments(id, company_document?.id, signed_document?.document_id), (comment: any, index) => (
                <CommentWrapper key={index} comment={comment}/>
              ))}
            </>
          )}
          {company_document.require_signature && !company_document.require_wet_signature && (
            <>
              <RequireSignDoc setDisabled={(disabled: boolean) => setIsDisabled(disabled)} programDocId={id}
                              isApplicationView={isApplicationView} doc={company_document} completed={completed}
                              signedDoc={signed_document}/>
              {map(getAcknowledgeComments(id, company_document.id), (comment: any, index) => (
                <CommentWrapper key={index} comment={comment}/>
              ))}
            </>
          )}
          {!company_document.require_signature && !company_document.require_wet_signature && (
            <>
              <ApproveDocs id={id} is_acknowledged={is_acknowledged} doc={company_document} callbackSubmit={onSubmit}/>
              {map(getAcknowledgeComments(id, company_document.id), (comment: any, index) => (
                <CommentWrapper key={index} comment={comment}/>
              ))}
            </>
          )}
        </div>
      ))}
    </InnerFieldContainer>);
}

export default ProgramDocs;