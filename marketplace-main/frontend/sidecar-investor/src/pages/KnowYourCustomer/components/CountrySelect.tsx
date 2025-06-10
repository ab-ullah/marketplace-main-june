import React, { FunctionComponent } from 'react';
import { SelectTypeData } from '../../../interfaces/workflows';
import { FieldComponent } from '../interfaces';
import CustomSelect from './CustomSelect';

interface CountrySelect extends FieldComponent {
}

const CountriesOptions = [
    { label: 'United States', value: 'US' },
    { label: 'Afghanistan', value: 'AF' },
    { label: 'Åland Islands', value: 'AX' },
    { label: 'Albania', value: 'AL' },
    { label: 'Algeria', value: 'DZ' },
];

const Select: FunctionComponent<CountrySelect> = ({ question , disabled}) => {
    const data = question.data as SelectTypeData;
    if (data.options !== undefined) {
        return <CustomSelect question={question} disabled={Boolean(disabled)}/>
    }
    const hidratedQuestion = Object.assign({}, question, { data: { options: CountriesOptions } });
    return <CustomSelect question={hidratedQuestion} disabled={Boolean(disabled)}/>
}

export default Select;