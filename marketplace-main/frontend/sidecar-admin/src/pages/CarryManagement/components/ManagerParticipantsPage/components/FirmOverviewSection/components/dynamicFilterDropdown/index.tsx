import { FC } from "react";
import Select, { OptionTypeBase } from "react-select";
import CheckboxSelector from "../../../../../../../../components/Form/CheckboxSelector";

type DynamicFilterDropdownProps = {
    config: {
        label: string;
        key: string;
        options: {label: string, value: string}[]
    }
    selectedOptions: OptionTypeBase[]
    onChange: (values: OptionTypeBase[]) => void
}

const DynamicFilterDropdown: FC<DynamicFilterDropdownProps> = ({ config, selectedOptions, onChange }) => {

    return <CheckboxSelector
    label={config.label}
    options={config.options}
    selectedOptions={selectedOptions ?? []}
    onChange={(values) => onChange(values)}
    name={config.key}
    noOptSelectedTxt="Select"
    enableSelectAll={config.options.length > 0}
  />

}

export default DynamicFilterDropdown