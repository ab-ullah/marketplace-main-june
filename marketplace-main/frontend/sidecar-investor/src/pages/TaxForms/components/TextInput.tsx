import React, { ChangeEvent, FunctionComponent } from 'react';
import { TextTypeData } from '../../../interfaces/workflows';
import { FieldComponent } from '../interfaces';
import TextField from '../../../components/Form/TextField';
import { InnerFieldContainer } from '../styles';
import { useField } from '../hooks'

interface TextInputProps extends FieldComponent {
}

const TextInput: FunctionComponent<TextInputProps> = ({ question }) => {
    const { field, helpers, handleBlur, handleFocus, isFocused } = useField(question.id, question.type);
    const { placeholder } = question.data as TextTypeData;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        helpers.setValue(e.target.value);
    }

    return <InnerFieldContainer>
        <TextField
            placeholder={placeholder}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={field.value}
            label={question.label}
            name={question.id}
            helpText={question.helpText}
            hideError={isFocused}
        />
    </InnerFieldContainer>
}

export default TextInput;