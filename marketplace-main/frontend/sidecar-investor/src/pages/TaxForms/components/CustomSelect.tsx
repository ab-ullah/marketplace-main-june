import { FunctionComponent, useEffect } from 'react';
import { DEFAULT_NON_SELECTABLE_OPTION } from '../constants';
import { CustomSelectTypeData } from '../../../interfaces/workflows';
import { FieldComponent } from '../interfaces';
import SelectorField from '../../../components/Form/SelectorField';
import { InnerFieldContainer } from '../styles';
import { OptionTypeBase } from "react-select";
import { useField } from '../hooks'

interface CustomSelectProps extends FieldComponent {
}
const CustomSelect: FunctionComponent<CustomSelectProps> = ({ question }) => {
    const { field, meta, helpers, handleBlur, handleFocus, isFocused } = useField(question.id, question.type);
    const data = question.data as CustomSelectTypeData;
    const unparsedOptions = [DEFAULT_NON_SELECTABLE_OPTION].concat(data.options);

    const options = unparsedOptions.map(option => ({
        value: option.value,
        label: option.label ?? (option as any).name 
    }))

    const handleChange = (e: OptionTypeBase) => {
        helpers.setValue(e.value);
    }

    useEffect(() => {
        if (field.value && !data.options.find(option => option.value == field.value)) { // eslint-disable-line eqeqeq
            helpers.setValue(DEFAULT_NON_SELECTABLE_OPTION.value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [field.value, data.options]);

    const lookupOption = typeof field.value === 'string' || typeof field.value === 'number';

    return <InnerFieldContainer>
        <SelectorField
            name={question.id}
            label={question.label}
            options={options}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={lookupOption ? options.find(option => option.value == field.value) : field.value} // eslint-disable-line eqeqeq
            placeholder={DEFAULT_NON_SELECTABLE_OPTION.value as string}
            helpText={question.helpText}
        />
        {!isFocused && meta.touched && meta.error && <div>{meta.error}</div>}
    </InnerFieldContainer>
}

export default CustomSelect;