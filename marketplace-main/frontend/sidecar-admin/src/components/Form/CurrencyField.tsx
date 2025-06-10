import React, { FunctionComponent } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { ErrorMessage } from "formik";
import Row from "react-bootstrap/Row";
import { Label, CurrencyFormat } from "./styles";

interface FormCurrencyFieldProps {
  label: string;
  name: string;
  placeholder: string;
  disabled?: boolean,
  onChange: (selectedValue: string) => void;
  onBlur: (e: any) => void;
  value: number | undefined;
  currencySymbol?: string;
}


const FormCurrencyField: FunctionComponent<FormCurrencyFieldProps> = ({
  label,
  name,
  disabled,
  placeholder,
  onChange,
  onBlur,
  value,
  currencySymbol,
}) => {
  return (
    <Row className={"mt-2"}>
      <Col md={12} className="field-label">
        <Label>{label}</Label>
      </Col>
      <Col md={12}>
        <Form.Group controlId="formFilterValue">
          <CurrencyFormat
            className={disabled ? "disabled" : ""}
            placeholder={placeholder}
            thousandSeparator={true}
            value={value || ""}
            prefix={currencySymbol ? currencySymbol : "$"}
            onValueChange={(values: any) => {
              const updatedValue = !disabled ? values.value : value;
               onChange(updatedValue);
            }}
            onBlur={onBlur}
            disabled={disabled}
            // fixedDecimalScale={!Number.isInteger(value)}
            decimalScale={2}
          />
          <ErrorMessage  className="text-danger" name={name} component="div" />
        </Form.Group>
      </Col>
    </Row>
  );
};

export default FormCurrencyField;
