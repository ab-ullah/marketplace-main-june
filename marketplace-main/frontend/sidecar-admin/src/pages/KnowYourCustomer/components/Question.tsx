import {FunctionComponent, useState, useMemo} from 'react';
import find from "lodash/find";
import get from "lodash/get";
import includes from "lodash/includes";
import {DocumentAnswer, KYCRecordResponse, Option} from '../../../interfaces/workflows';
import {
  ApproveButton,
  CommentBadge,
  FileFlagWrapper,
  QuestionContainer,
  QuestionFileTag,
  QuestionFlag,
  QuestionInner,
  QuestionLabel
} from '../styles';
import {useAppDispatch, useAppSelector} from '../../../app/hooks';
import {ParsedQuestion} from '../interfaces';
import {VALUE_TYPES} from '../constants';
import {selectKYCState, makeDocumentSelector} from '../selectors';
import FilePreview from './FilePreview';
import RequestModal from './RequestModal';
import EligibilityCriteriaAnswer from "./EligibilityCriteriaAnswer";
import {KYC_RECORD, PARTICIPANT} from "../../../constants/commentModules";
import {COMMENT_CREATED, COMMENT_UPDATED} from "../../../constants/commentStatus";
import { CommentApproveButton } from './TaxFormDocument/styles';
import { approveComment } from '../thunks';
import { isArray, isNil } from 'lodash';
import Replies from './Replies';


interface QuestionProps {
  question: ParsedQuestion;
  moduleId?: number;
  answer: DocumentAnswer[] | string | number | null;
  record: KYCRecordResponse;
  questionIdPrefix?: string;
  isParticipant?: boolean;
}

const Question: FunctionComponent<QuestionProps> = ({answer, record, question, questionIdPrefix, isParticipant, moduleId}) => {
  const dispatch = useAppDispatch();
  const {commentsByRecord} = useAppSelector(selectKYCState);
  const [showModal, setShowModal] = useState(false);
  const [documentId, setDocumentId] = useState<string>('')
  const selectDocuments = useMemo(makeDocumentSelector, []);
  const recordId = moduleId || record.id;
  const documents = useAppSelector((state) => selectDocuments(state, recordId));
  const questionId = `${questionIdPrefix || ""}${question.id}`;
  const module = isParticipant ? PARTICIPANT : KYC_RECORD;
  
  const commentsOfThisQuestion = get(
    commentsByRecord,
    `${module}.${recordId}.${questionId}`
  );

  const flagged = find(commentsOfThisQuestion, (comment) => [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status));

  const hideModal = () => setShowModal(false);
  const flagQuestion = () => setShowModal(true);

  const isDocumentCommentFlagged = (document_id: string) => {
    const fileInfo = documents?.find(doc => doc.record_id === recordId && 
      doc.field_id === question.id && document_id === doc.document.document_id);
    if(fileInfo){
      const docId = fileInfo.document.document_id;
      const commentsOfThisDocument = get(
        commentsByRecord,
        `${module}.${recordId}.${docId}.${docId}`
      );
      return !isNil(commentsOfThisDocument) && [COMMENT_CREATED, COMMENT_UPDATED].includes(commentsOfThisDocument.status)
    }
    return false;
  }

  const flagDocumentQuestion = (document_id: string) => {
    const fileInfo = documents.find(doc => doc.record_id === recordId 
      && doc.field_id === question.id && document_id === doc.document.document_id);
    const documentId = fileInfo && fileInfo.document.document_id;
    if(documentId){
      setDocumentId(documentId);
      setShowModal(true);
    }
  }

  const getDocumentComment = (document_id: string) => {
    const fileInfo = documents?.find(doc => doc.record_id === recordId && 
      doc.field_id === question.id && document_id === doc.document.document_id);
    if(fileInfo){
      const docId = fileInfo.document.document_id;
      const commentsOfThisDocument: any = get(
        commentsByRecord,
        `${module}.${recordId}.${docId}.${docId}`
      );
      return commentsOfThisDocument
    }
    return false;
  }

  const handleApproveComment = () => {
    dispatch(approveComment(flagged.id))
  }

  const handleApproveDocumentComment = (document_id: string) => {
    const fileInfo = documents?.find(doc => doc.record_id === recordId 
      && doc.field_id === question.id && document_id === doc.document.document_id);
    if(fileInfo){
      const docId = fileInfo.document.document_id;
      const commentsOfThisDocument = get(
        commentsByRecord,
        `${module}.${recordId}.${docId}.${docId}`
      );
      if(commentsOfThisDocument) dispatch(approveComment(commentsOfThisDocument.id))
    }
  }

  const getDocumentQuestionIdentifier = () => {
    if(documentId) return documentId;
    else return questionId;
  }

  const getDocumentTitle = () => {
    if(!documentId) return question.label;
    const fileInfo = documents?.find(doc => doc.record_id === recordId 
      && doc.field_id === question.id && doc.document.document_id === documentId);
    if(fileInfo){
      return `${question.label}: ${fileInfo.document.title}`
    }
    else {
      return question.label
    }
  }

  return <QuestionContainer>
    <RequestModal
      show={showModal}
      onHide={hideModal}
      fieldValue={question.label}
      module={module}
      kycRecordId={record.id}
      moduleId={recordId}
      questionIdentifier={question.type === VALUE_TYPES.FILE ? getDocumentQuestionIdentifier() : questionId}
      commentFor={record.user.id}
      documentIdentifier={documentId}
      commentLabel={getDocumentTitle()}
    />
    <QuestionInner>
      <QuestionLabel>{question.label}<br/><small><i>{question.description}</i></small></QuestionLabel>
      {question.type === VALUE_TYPES.FILE && <>
        <QuestionFlag inlineFlag={true} flagged={flagged} onClick={flagQuestion}/>
        {flagged && <CommentApproveButton onClick={handleApproveComment}>Approve</CommentApproveButton>}
        {flagged && <Replies comment={get(commentsOfThisQuestion, '')}/>}
      </>}

    </QuestionInner>
    <QuestionInner>
      {question.type === VALUE_TYPES.DIRECT_ANSWER && (
        <span>
          {answer}
          <QuestionFlag inlineFlag={true} flagged={flagged} onClick={flagQuestion}/>
          {flagged && <CommentApproveButton onClick={handleApproveComment}>Approve</CommentApproveButton>}
          {flagged && <Replies comment={get(commentsOfThisQuestion, '')}/>}
          </span>
          )}
      {includes(
        [VALUE_TYPES.ELIGIBILITY_CRITERIA, VALUE_TYPES.INVESTMENT_AMOUNT_RESPONSE,VALUE_TYPES.INVESTMENT_AMOUNT_RESPONSE_NO_FLAG, VALUE_TYPES.CASHLESS_COMMITMENT, VALUE_TYPES.LEVERAGE_AMOUNT], question.type
      ) && (
        <EligibilityCriteriaAnswer
          answer={question.submitted_answer}
          question={question}
          record={record}
          hideFlag={question.type===VALUE_TYPES.INVESTMENT_AMOUNT_RESPONSE_NO_FLAG}
        />
      )}
      {question.type === VALUE_TYPES.LOOKUP_VALUE && (
        <span>{find(question?.data?.options, (option: Option) => option.value == answer)?.label}<QuestionFlag
          inlineFlag={true} flagged={flagged} onClick={flagQuestion}/>
          {flagged && <CommentApproveButton onClick={handleApproveComment}>Approve</CommentApproveButton>}
          {flagged && <Replies comment={get(commentsOfThisQuestion, '')}/>}
          </span>)} {/* eslint-disable-line eqeqeq */}
      {question.type === VALUE_TYPES.FILE && <QuestionFileTag>
        { answer && isArray(answer) ? answer.map((document: DocumentAnswer) => (<div>
          <FilePreview
          documentName={document.title as string}
          documentId={document.document_id}
          title={question.label}
          recordId={recordId}
          questionId={question.id}
          FlagComponent={<QuestionFlag flagged={flagged} onClick={flagQuestion}/>}
          isDownloadAllowed
        />
        <QuestionFlag flagged={isDocumentCommentFlagged(document.document_id)} onClick={()=>flagDocumentQuestion(document.document_id)} inlineFlag/>
        {isDocumentCommentFlagged(document.document_id) && 
        <CommentApproveButton onClick={() => handleApproveDocumentComment(document.document_id)}>Approve</CommentApproveButton>}
        {isDocumentCommentFlagged(document.document_id) && <Replies comment={getDocumentComment(document.document_id)}/>}
        </div>)): <>
        <CommentBadge>Pending</CommentBadge>
        </>}
      </QuestionFileTag>}
      {!includes([VALUE_TYPES.ELIGIBILITY_CRITERIA, VALUE_TYPES.INVESTMENT_AMOUNT_RESPONSE,VALUE_TYPES.INVESTMENT_AMOUNT_RESPONSE_NO_FLAG, VALUE_TYPES.CASHLESS_COMMITMENT,VALUE_TYPES.LEVERAGE_AMOUNT, VALUE_TYPES.DIRECT_ANSWER, VALUE_TYPES.LOOKUP_VALUE, VALUE_TYPES.FILE ], question.type) && (
        <FileFlagWrapper>
          <QuestionFlag flagged={flagged} onClick={flagQuestion} inlineFlag/>
          {flagged && <CommentApproveButton onClick={handleApproveComment}>Approve</CommentApproveButton>}
          {flagged && <Replies comment={get(commentsOfThisQuestion, '')}/>}
          </FileFlagWrapper>
      )}
    </QuestionInner>
  </QuestionContainer>
}

export default Question;