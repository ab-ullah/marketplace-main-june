import React, { ChangeEvent, FunctionComponent } from 'react';
import { NumberTypeData } from '../../../interfaces/workflows';
import { FieldComponent } from '../interfaces';
import NumberField from '../../../components/Form/NumberField';
import { InnerFieldContainer } from '../styles';
import { useField } from '../hooks'

interface NumberInputProps extends FieldComponent {
}


const NumberInput: FunctionComponent<NumberInputProps> = ({ question }) => {
    const { field, helpers, handleBlur, handleFocus, isFocused } = useField(question.id, question.type);
    const { min, max, placeholder } = question.data as NumberTypeData;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        helpers.setValue(e.target.value);
    }

    return <InnerFieldContainer>
        <NumberField
            placeholder={placeholder}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={field.value}
            label={question.label}
            name={question.id}
            min={min}
            max={max}
            hideError={isFocused}
            helpText={question.helpText}
        />
    </InnerFieldContainer>
}

export default NumberInput;