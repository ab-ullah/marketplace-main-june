import { FunctionComponent } from "react";
import Form from "react-bootstrap/Form";
import styled from 'styled-components';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

interface CriteriaBlockDocument {
  document_name: string;
  document_id: string;
  doc_id: number;
}


interface IApprovalDropdown {
  document: CriteriaBlockDocument; 
  value: boolean; 
  disabled: boolean;
  onChange: (val: boolean) => void;
}

const FormGroup = styled(Form.Group)`
  position: relative;
  select {
    display: inline-block;
    width: auto;
    margin: 0 8px;
    font-size: 14px;
    font-weight: 600;
    padding-right: 18px;
  }
  select + svg {
    position: absolute;
    right: 6px;
    height: 19px;
    top: 10px;
    fill: #666;
  }
`;

const ApprovalDropdown: FunctionComponent<IApprovalDropdown> = ({ document, value, disabled, onChange }) => {
  
  const handleChange = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    onChange && onChange(Boolean(e.target.value));
  }

  const handleClick = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
  }

  return (<FormGroup onClick={handleClick}>
    <Form.Label >{document.document_name}</Form.Label>
    <Form.Control as="select" onChange={handleChange} disabled={disabled} value={value ? "1" : ""}>
      <option value="">I Object</option>
      <option value="1">I Agree</option>
    </Form.Control>
    <KeyboardArrowDownIcon />
  </FormGroup>);
}

export default ApprovalDropdown;