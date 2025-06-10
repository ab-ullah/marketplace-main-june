import React, {FunctionComponent, useState} from 'react';
import size from "lodash/size";
import isNil from 'lodash/isNil';
import {IEligibilityCriteriaAnswer, ParsedQuestion} from '../interfaces';
import FilePreview from './FilePreview';
import {EligibilityAnswerDiv, EligibilityDocuments, QuestionFlag} from "../styles";
import CurrencyFormat from 'react-currency-format';
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import RequestModal from "./RequestModal";
import {selectApplicationInfo, selectKYCState} from "../selectors";
import find from "lodash/find";
import get from "lodash/get";
import {ELIGIBILITY_CRITERIA, INVESTMENT_ALLOCATION} from "../../../constants/commentModules";
import {KYCRecordResponse} from "../../../interfaces/workflows";
import {approveComment} from '../thunks';
import {CommentApproveButton} from './TaxFormDocument/styles';
import {COMMENT_CREATED, COMMENT_UPDATED} from '../../../constants/commentStatus';
import {VALUE_TYPES} from "../constants";
import Replies from './Replies';

interface EligibilityCriteriaAnswerProps {
  answer: IEligibilityCriteriaAnswer;
  question: ParsedQuestion;
  record: KYCRecordResponse;
  hideFlag?: boolean
}

const EligibilityCriteriaAnswer: FunctionComponent<EligibilityCriteriaAnswerProps> = (
  {
    answer,
    record,
    question,
    hideFlag
  }) => {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();
  const applicationInfo = useAppSelector(selectApplicationInfo);
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);

  const showFlag = !Boolean(hideFlag)

  const {commentsByRecord, fund} = useAppSelector(selectKYCState);

  const isInvestmentQuestion = question.type === VALUE_TYPES.INVESTMENT_AMOUNT_RESPONSE

  if (!applicationInfo) return <></>
  const commentPath = isInvestmentQuestion ?  `${INVESTMENT_ALLOCATION}.${applicationInfo?.investment_detail?.id}.${question?.id}` : `${ELIGIBILITY_CRITERIA}.${applicationInfo?.eligibility_response}.${question?.id}` 
  const commentsOfThisQuestion =  get(commentsByRecord, commentPath);

  if (!applicationInfo) return <></>

  const handleAddDocumentComment = (id: string) => {
    setDocumentId(id)
    flagQuestion()
  }

  const handleAddQuestionComment = () => {
    setDocumentId(undefined)
    flagQuestion()
  }

  const hideModal = () => setShowModal(false);
  const flagQuestion = () => setShowModal(true);

  const getQuestionLabel = () => {
    if (documentId && get(question, 'submitted_answer.approval_documents')) {
      const selectedDoc = find(get(question, 'submitted_answer.approval_documents'), (doc) => doc.document_id === documentId)
      return selectedDoc?.document_name;
    }
    if (documentId && get(question, 'submitted_answer.documents')) {
      const selectedDoc = find(get(question, 'submitted_answer.documents'), (doc) => doc.document_id === documentId)
      return selectedDoc?.document_name;
    }
    return question.label;
  }

  const isDocumentCommentFlagged = (id: number | string) => {
    const comment = commentsOfThisQuestion && commentsOfThisQuestion[id]
    return comment && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status)
  }

  const isQuestionFlagged = () => {
    const comment = commentsOfThisQuestion && commentsOfThisQuestion['']
    return !isNil(comment) && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status)
  }

  const getModule = () => {
    if(isInvestmentQuestion)
      return INVESTMENT_ALLOCATION;
    return ELIGIBILITY_CRITERIA;
  }

  const getModuleId = () => {
    if(isInvestmentQuestion)
      return get(applicationInfo, 'investment_detail.id');
    return get(applicationInfo, 'eligibility_response');
  }

  const getComment = () => {
    return commentsOfThisQuestion && commentsOfThisQuestion['']
  }

  const getDocumentComment = (id: number | string) => {
    const comment = commentsOfThisQuestion && commentsOfThisQuestion[id]
    return comment
  }

  const handleApproveComment = (commendId: any) => {
    dispatch(approveComment(commendId))
  }

  const getCommentLabel = () => {
    if (documentId && get(question, 'submitted_answer.approval_documents')) {
      const selectedDoc = find(get(question, 'submitted_answer.approval_documents'), (doc) => doc.document_id === documentId)
      return `${question.label}: ${selectedDoc?.document_name}`;
    }
    if (documentId && get(question, 'submitted_answer.documents')) {
      const selectedDoc = find(get(question, 'submitted_answer.documents'), (doc) => doc.document_id === documentId)
      return `${question.label}: ${selectedDoc?.document_name}`;
    }
    return question.label
  }

  
  const getRatioFieldValue = (type: string, value: any) => {
    if(type.includes('leverage-requested')) {
      return `${value} - ${applicationInfo.investment_detail.leverage_option_description}`
    } else if(type.includes('final-leverage')) {
      return `${value} - ${applicationInfo.investment_detail.final_leverage_option_description}`
    }
    return value
  }

  return <EligibilityAnswerDiv>
    {answer.answer_values?.map((answerValue, key) => <div key={key} className={'mb-3'}>
      {typeof answerValue === 'number' ?
        <CurrencyFormat value={answerValue} displayType={'text'} thousandSeparator={true} prefix={`${get(fund, 'currency.code', 'USD')} `} fixedDecimalScale={!Number.isInteger(answerValue)}
        decimalScale={2}/>
        : question.id.includes('leverage-requested') || question.id.includes('final-leverage') ? getRatioFieldValue(question.id, answerValue) : <div>{answerValue}</div>}
      {showFlag && (size(answer.answer_values) - 1 === key) && (
        <div className="flag mb-3"><QuestionFlag
          inlineFlag
          flagged={isQuestionFlagged()}
          onClick={() => handleAddQuestionComment()}
        />
        {isQuestionFlagged() && <CommentApproveButton onClick={() => handleApproveComment(getComment()?.id)}>Approve</CommentApproveButton>}
        </div>
      )}
      {showFlag && isQuestionFlagged() && <Replies comment={getComment()} />}
    </div>)}
    <EligibilityDocuments>
      {answer.documents?.map((document, key) => {
        return (
          <div key={key} className={"mb-3"}>
            <FilePreview
              documentName={document.document_name}
              title={question.label}
              recordId={record.id}
              questionId={question.id}
              documentId={document.document_id}
              isDownloadAllowed
            />
            {showFlag &&
            <div className="flag">
              <QuestionFlag
                inlineFlag
                flagged={isDocumentCommentFlagged(document.document_id)}
                onClick={() => handleAddDocumentComment(document.document_id)}
              />
              {isDocumentCommentFlagged(document.document_id) && 
              <CommentApproveButton onClick={() => handleApproveComment(getDocumentComment(document.document_id)?.id)}>Approve</CommentApproveButton>}
            </div>}
            {showFlag && isDocumentCommentFlagged(document.document_id) && <Replies comment={getDocumentComment(document.document_id)}/>}
          </div>
        );
      })}
    </EligibilityDocuments>

    {answer?.approval_documents?.map((document, key) => {
      return (
        <div key={key} className={"mb-3"}>
          <FilePreview
            documentName={document.document_name}
            title={question.label}
            recordId={record.id}
            questionId={question.id}
            documentId={document.document_id}
          />
          {showFlag &&
          <div className="flag">
            <QuestionFlag 
              inlineFlag 
              flagged={isDocumentCommentFlagged(document.document_id)} 
              onClick={() => handleAddDocumentComment(document.document_id)}/>
          </div>
    }
          {showFlag && isDocumentCommentFlagged(document.document_id) && 
              <CommentApproveButton onClick={() => handleApproveComment(getDocumentComment(document.document_id))}>Approve</CommentApproveButton>}
          {showFlag && isDocumentCommentFlagged(document.document_id) && <Replies comment={getDocumentComment(document.document_id)}/>}
        </div>
      );
    })}
    <RequestModal
      show={showModal}
      onHide={hideModal}
      fieldValue={getQuestionLabel()}
      applicationId={applicationInfo.id}
      module={getModule()}
      moduleId={getModuleId()}
      questionIdentifier={question.id}
      documentIdentifier={documentId}
      commentFor={record.user.id}
      commentLabel={getCommentLabel()}
    />
  </EligibilityAnswerDiv>
}

export default EligibilityCriteriaAnswer;