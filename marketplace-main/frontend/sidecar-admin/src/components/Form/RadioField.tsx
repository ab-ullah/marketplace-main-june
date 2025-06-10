import { FunctionComponent } from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { ErrorMessage } from "formik";
import styled from "styled-components";
import { Label } from "./styles";
import get from "lodash/get";

interface RadioFieldProps {
    label: string;
    name: string;
    disabled?: boolean;
    className?: string;
    options: ISelectOption[];
    onChange: any;
    value: any;
    vertical?: boolean;
}

export interface ISelectOption {
    label: string;
    value: number | string;
    disabled?: boolean;
}

const ControlContainer = styled(Form.Check.Input)`
    padding: 0 !important;
    margin: auto;
    width: 18px !important;
    height: 18px !important;
    background-color: transparent !important;
    border-color: ${(props: any) => props.checked ? 'white' : '#78909C'} !important;
`;

const OptionLabel: any = styled.label`
    cursor: pointer;
    padding-left: 8px;
    padding-right: 0;
    color: ${(props: any) => props.checked ? 'white' : props.theme.palette.eligibilityTheme.black};
`;

const RadioOptionInner: any = styled.div`
    align-items: center;
    background-color: ${(props: any) => props.checked ? '#2E86DE' : '#EBF3FB'};
    border-radius: 4px;
    display: flex;
    cursor: pointer;
    margin-right: 8px;
    padding: 8px 12px;
    .form-check-input{
        border: 1px solid #78909C;
    }
    &.disabled {
        background-color: ${(props: any) => props.checked ? '#CFD8DC' : '#EBF3FB'};
    }
`;

const RadioOptionsContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
`;

const RadioField: FunctionComponent<RadioFieldProps> = ({ label, name, className, options, disabled, onChange, value, vertical}) => {
    const handleChange = ({ value, label }: ISelectOption) => {
        onChange({ value, label })
    };
    return <Row className={'mt-2'}>
        <Label>{label}</Label>
        <Form.Group controlId="formFilterValue">
            <RadioOptionsContainer style={{display: "flex", flexDirection: vertical ? "column" : "row", float: "left", alignItems: "baseline"}}>
                {options.map((o: ISelectOption) => {
                    const select = (e: any) => {
                        if(!disabled && !o.disabled)
                            handleChange(o)
                    }
                    const isChecked = o.value === get(value, 'value', value);
                    return <RadioOptionInner key={o.value} radioGroup="name" onChange={select} onClick={select} checked={isChecked} className={`radio-input-container ${isChecked ? 'checked' : ''} ${disabled ? "disabled" : ''} ${className || ""}`}>
                        <ControlContainer type='radio' isValid name={name} disabled={o.disabled}  value={o.value} checked={isChecked} />
                        <OptionLabel checked={isChecked}>{o.label}</OptionLabel>
                    </RadioOptionInner>
                })}
            </RadioOptionsContainer >
            <ErrorMessage className="text-danger" name={name} component="div" />
        </Form.Group >
    </Row >
}



export default RadioField;