import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import styled from "styled-components";
import { ErrorMessage, useField } from "formik";

const LabelCol = styled(Col)`
  font-size: 15px !important;
  font-weight: 700 !important;
  line-height: 21px;
  padding-bottom: 6px;
`;

const Editor = styled(ReactQuill)`
  background-color: white;
  max-height: 300px;
  overflow: auto;
  position: relative;

  .ql-toolbar {
    background-color: white;
    position: sticky;
    z-index: 1;
    top: 0;
  }
  .ql-container {
    min-height: 190px;
  }
`;

interface TextEditorProps {
  label: string;
  name: string;
  onChange: any;
  value?: string;
  error?: any;
}

const TextEditor = ({
  label,
  name,
  onChange,
  value,
  error,
}: TextEditorProps) => {
  const handleChange = (val: any) => {
    console.log(val, "value");
    onChange(val);
  };

  let field;
  try {
    const fieldInfo = useField(name);
    field = fieldInfo[0];
  } catch (e) {
    field = false;
  }

  return (
    <Row className={"mt-2"}>
      <LabelCol md="12" className="field-label">
        {label}
      </LabelCol>
      <Col md="12">
        <Editor value={value} onChange={handleChange} />
        {field && (
          <ErrorMessage className="text-danger" name={name} component="div" />
        )}
        {error && <p className="text-danger">{error}</p>}
      </Col>
    </Row>
  );
};

export default TextEditor;
