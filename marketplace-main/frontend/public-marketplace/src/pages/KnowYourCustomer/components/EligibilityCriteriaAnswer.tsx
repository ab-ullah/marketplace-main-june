import React, {FunctionComponent} from 'react';
import map from "lodash/map";
import {FieldComponent} from '../interfaces';
import DocumentUploadSection from "./UserDocuments/DocumentUploadSection";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {selectKYCRecord} from "../selectors";
import {fetchAdditionalCards, fetchCommentsByApplicationId} from "../thunks";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {selectAppRecords} from "../../TaxForms/selectors";
import CommentWrapper from '../../../components/CommentWrapper';
import FilePreview from '../components/FilePreview';
import {Comment, Comment as IComment} from "../../../interfaces/workflows";
import get from "lodash/get"
import {ELIGIBILITY_CRITERIA} from "../../../constants/commentModules";

interface EligibilityCriteriaAnswerProps extends FieldComponent {
}

interface IContext {
  comments: IComment[]
}

const EligibilityCriteriaAnswer: FunctionComponent<EligibilityCriteriaAnswerProps> = ({question}) => {
  const {applicationRecord, commentsByRecord} = useAppSelector(selectKYCRecord);
  const {appRecords} = useAppSelector(selectAppRecords);
  const dispatch = useAppDispatch();

  if (!applicationRecord || appRecords?.length === 0) return <></>

  const moduleComments = get(commentsByRecord, `${ELIGIBILITY_CRITERIA}.${appRecords[0].eligibility_response}`)
  const answer = question.submitted_answer;
  if (!answer) return <></>

  const fetchEligibilityCards = () => {
    if (appRecords && appRecords[0]) dispatch(fetchAdditionalCards(appRecords[0].id))
    dispatch(fetchCommentsByApplicationId(appRecords[0].id));
  }

  return <div className={'mt-4'}>
    <Row>
      <Col md={12} className={'field-label'}>
        {question.label}
      </Col>
    </Row>
    {answer.answer_values.map((answerValue, key) => <div key={key} className={'mb-3'}>
      {answerValue}
    </div>)}
    {map(get(answer, 'sub_answer_details'), (details, key) => (
      <div key={key} className={'mb-3'}>
        <div className="field-label">{details.label}</div>
        <p>{details.value}</p>
      </div>
    ))}
    {map(get(moduleComments, `${question.id}.`), (comment: IComment) => (<CommentWrapper comment={comment}/>))}
    {answer.documents?.map((requiredDocument, key) => {
      const questionComments = get(moduleComments, `${question.id}-view-only`)
      let comments = [] as Comment[];
      requiredDocument.documents.forEach(document => {
        const documentComments = questionComments && questionComments[document.document_id];
        if (documentComments) comments = comments.concat(documentComments)
      })
      return <div key={key} className={'mb-3'}>
        <DocumentUploadSection
          requiredDocument={requiredDocument}
          postUpload={fetchEligibilityCards}
          postDelete={fetchEligibilityCards}
          comments={comments}
        />
      </div>
    })}
    {answer.approval_documents?.map((document, key) => {
      const docComments = get(moduleComments, `${question.id}.${document.document_id}`);
      return (
        <div key={key} className={"mb-3"}>
          <FilePreview
            documentName={document.document_name}
            title={question.label}
            questionId={question.id}
            documentId={document.document_id}
          />
          {map(docComments, (comment: IComment) => (<CommentWrapper key={key} comment={comment}/>))}
        </div>
      );
    })}
  </div>

}

export default EligibilityCriteriaAnswer;