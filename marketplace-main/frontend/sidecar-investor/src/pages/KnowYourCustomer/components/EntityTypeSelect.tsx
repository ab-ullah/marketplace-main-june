import React, { ChangeEvent, FunctionComponent } from "react";
import get from "lodash/get";
import { useParams } from "react-router-dom";
import { isToolTipText } from "../../../components/ToolTip/interfaces";
import { CustomSelectTypeData } from "../../../interfaces/workflows";
import CommentWrapper from "../../../components/CommentWrapper";
import ToolTip from "../../../components/ToolTip";
import { FieldComponent } from "../interfaces";
import { CommentsContext } from "../../ApplicationView";
import {
  InnerFieldContainer,
  RadioButton,
  RadioInner,
  RadioInput,
} from "../styles";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ErrorMessage } from "formik";
import { useField } from "../hooks";
import { useSaveApplicationEntityTypeMutation } from "../../../api/rtkQuery/fundsApi";
import {
  KYC_PRIVATE_COMPANY_INVESTOR,
  KYC_LIMITED_PARTNERSHIP_INVESTOR,
  KYC_TRUST_INVESTOR,
  KYC_INVESTOR_TYPE,
  AML_FLOW_SLUGS,
} from "../constants";
import {OptionTypeBase} from "react-select";

const getEntityTypeConfig = (key: any) => {
  if(AML_FLOW_SLUGS && KYC_INVESTOR_TYPE)
    return {
      [AML_FLOW_SLUGS[key]]: KYC_INVESTOR_TYPE[key],
    }
  return {};
}


interface EntityTypeSelectProps extends FieldComponent {}

const EntityTypeSelect: FunctionComponent<EntityTypeSelectProps> = ({
  comments,
  question,
    customOnBlur,
    disabled
}) => {
  const { field, helpers, isFocused } = useField(question.id, question.type);
  const { externalId } = useParams<{ externalId: string }>();
  const [saveEntityType] = useSaveApplicationEntityTypeMutation();
  const { options } = question.data as CustomSelectTypeData;
  const { helpText, label } = question;

  const entityType = {
    ...getEntityTypeConfig(KYC_PRIVATE_COMPANY_INVESTOR),
    ...getEntityTypeConfig(KYC_LIMITED_PARTNERSHIP_INVESTOR),
    ...getEntityTypeConfig(KYC_TRUST_INVESTOR),
  };

  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (question.disabled) return;
    helpers.setValue(e.target.id);
  };

  const wrapOnBlur = (e: OptionTypeBase) => {
    if (customOnBlur) {
      customOnBlur(e)
    }
  }

  const onClick = (value: string | number) => {
    helpers.setValue(value);
  };

  return (
    <InnerFieldContainer>
      <CommentsContext.Consumer>
        {({ recordUUID, fetchKYCRecord }) => (
          <Row className={"mt-2"}>
            <Col md={4} className="field-label">
              {label}
              {isToolTipText(helpText) && <ToolTip {...helpText} />}
            </Col>
            {typeof helpText === "string" && (
              <Col md={8} className="field-help-text">
                <span>{helpText}</span>
              </Col>
            )}
            <Col md={8}>
              <Row>
                {options.map((option) => {
                  const isChecked = option.value == field.value; // eslint-disable-line eqeqeq
                  return (
                    <RadioButton
                      key={option.value}
                      checked={isChecked}
                      onClick={() => {
                      if( !disabled) {saveEntityType({
                          recordUUID,
                          externalId,
                          kycInvestorType: get(entityType, option.value),
                        }).then(fetchKYCRecord);
                        onClick(option.value);}
                      }}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        id={option.value.toString()}
                        name={question.id}
                        checked={isChecked}
                        onChange={handleChange}
                        onBlur={wrapOnBlur}
                        onClick={() => onClick(option.value)}
                        disabled={Boolean(disabled)}
                      ></input>
                      <RadioInput checked={isChecked}>
                        <RadioInner checked={isChecked} />
                      </RadioInput>
                      <label>{option.label}</label>
                    </RadioButton>
                  );
                })}
              </Row>
              {!isFocused && (
                <ErrorMessage className={"text-danger"} name={question.id} component="div" />
              )}
            </Col>
          </Row>
        )}
      </CommentsContext.Consumer>
      {comments?.map((comment) => (
        <CommentWrapper key={comment.id} comment={comment} />
      ))}
    </InnerFieldContainer>
  );
};

export default EntityTypeSelect;
