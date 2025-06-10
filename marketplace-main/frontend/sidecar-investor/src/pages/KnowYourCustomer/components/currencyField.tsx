import React, {ChangeEvent, FunctionComponent} from "react";
import { TextTypeData } from "../../../interfaces/workflows";
import { FieldComponent } from "../interfaces";
import { InnerFieldContainer, CurrencyInput } from "../styles";
import { useField } from "../hooks";
import { Form } from "react-bootstrap";
import { ErrorMessage } from "formik";
import { useParams } from "react-router-dom";
import { useGetFundDetailsQuery } from "../../../api/rtkQuery/fundsApi";
import { isToolTipText } from "../../../components/ToolTip/interfaces";
import ToolTip from "../../../components/ToolTip";

interface CurrencyFieldProps extends FieldComponent {}

const CurrencyField: FunctionComponent<CurrencyFieldProps> = ({ question, customOnBlur, isInspectletSensitive, disabled }) => {
  const { externalId } = useParams<{ externalId: string }>();
  const { data: fundDetails } = useGetFundDetailsQuery(externalId);
  const currencyCode = fundDetails?.currency
    ? fundDetails?.currency.code
    : "USD";
  const { field, helpers, handleBlur, handleFocus } = useField(
    question.id,
    question.type
  );
  const { placeholder } = question.data as TextTypeData;

  const handleChange = (value: string) => {
   if(!disabled) helpers.setValue(value);
  };

    const wrapOnBlur = (e: ChangeEvent<HTMLInputElement>) => {
        if(customOnBlur){
            customOnBlur(e)
        }
        return handleBlur(e)
    }

  return (
    <InnerFieldContainer className={isInspectletSensitive ? 'inspectlet-sensitive': ''}>
      <Form.Label className='field-label'>
          {question.label}
          {isToolTipText(question.helpText) && <ToolTip {...question.helpText} />}
      </Form.Label>
      {(typeof question.helpText === "string") && <span>{question.helpText}</span>}
      <CurrencyInput
        name={question.id}
        label={question.label}
        placeholder={placeholder}
        thousandSeparator={true}
        prefix={`${currencyCode} `}
        onValueChange={(values: { value: any }) => {
          const { value } = values;
          handleChange(value);
        }}
        onBlur={wrapOnBlur}
        onFocus={handleFocus}
        value={field.value ? field.value : 0}
        disabled={disabled}
      />
      <ErrorMessage
        name={question.id}
        component="div"
        className={"errorText"}
      />
    </InnerFieldContainer>
  );
};

CurrencyField.defaultProps = {
  isInspectletSensitive: true
}

export default CurrencyField;
