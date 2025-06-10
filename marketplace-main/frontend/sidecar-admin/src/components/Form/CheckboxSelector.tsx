import React, { useState, useEffect, useRef } from "react";
import Select, { ValueType, ActionMeta, components } from "react-select";
import { Col, Form, Row } from "react-bootstrap";
import styled from "styled-components";
import { ErrorMessage, useField } from "formik";

interface OptionType {
  label: string;
  value: string;
}

interface CheckboxSelectorProps {
  options: any[];
  selectedOptions: any[];
  onChange: (selected: any[]) => void;
  label?:string;
  optional?:boolean;
  name:string;
  error?: any;
  noOptSelectedTxt?:string;
  enableSelectAll?: boolean; // Not to be uses incase of nested options
  enableSearch?: boolean
  isDisabled?: boolean
}

const LabelCol = styled(Col)`
  line-height: 21px;
  font-size: 15px !important;
  font-weight: 700 !important;
  padding-bottom: 6px;
`;

const OptionalTag = styled.p`
  color: #78909c;
  line-height: 21px;
  font-size: 15px !important;
  font-weight: 700 !important;
  margin: 0px;
  margin-left:5px;
`;

const CheckBox = styled(Form.Check)`
  input {
    padding: 9px;
    border: 1px solid grey;
    margin-top: 1px;
    cursor: pointer;
    width: auto;
    margin-right: 10px;
  }
`;

const StyledSelect = styled(Select)`
>div{
  min-height: 48px;
}
.form-check {
  display: flex;
  align-items: center;
}
`

type Option = {
  label: string;
  value: string;
  is_deal: boolean;
};

type GroupedOption = {
  label: string;
  options: Option[];
};

type Data = (Option | GroupedOption)[];

const filterOptions = (data: Data, searchTerm: string): Data => {
  const lowercasedSearchTerm = searchTerm.toLowerCase();

  return data
    .map((item) => {
      // Check if the item is a group with options
      if ('options' in item) {
        const filteredOptions = item.options.filter(option =>
          option.label.toLowerCase().includes(lowercasedSearchTerm)
        );
        return { ...item, options: filteredOptions };
      } else {
        // Directly filter flat options
        return item.label.toLowerCase().includes(lowercasedSearchTerm) ? item : null;
      }
    })
    .filter(item => item && (!('options' in item) || item.options.length > 0)) as Data;
};

const CustomOption = (props: any) => {
  return (
    <div
      onClick={() => props.selectOption(props.data)}
      style={{ padding: "10px" }}
    >
      <CheckBox
        type="checkbox"
        checked={props.isSelected}
        label={props.label}
        onChange={() => null}
      />
    </div>
  );
};

const CustomValueContainer = ({ children, getValue, noOptSelectedTxt ,enableSelectAll,showSearch, search, setSearch, ...props }:any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

    const numValues = getValue().filter(
        (option:any) => option.value !== "selectAll"
      ).length

    const options=props.options.filter(
        (option:any) => option.value !== "selectAll"
      )

    return (
      <components.ValueContainer {...props}>
        <div style={{ width: "100%" }}>
          {showSearch ? (
            <input
              ref={inputRef}
              onKeyDown={(e)=>e.stopPropagation()}
              placeholder="Type to search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", width: "100%", outline: "none" }}
            />
          ) : (
            <>
              {`${
                options.length &&
                numValues === options.length &&
                enableSelectAll
                  ? "All Options are selected"
                  : numValues
                  ? `${numValues} option${numValues !== 1 ? "s" : ""} selected`
                  : noOptSelectedTxt
              }`}
            </>
          )}
        </div>
      </components.ValueContainer>
    );
  };
  

const CheckboxSelector: React.FC<CheckboxSelectorProps> = ({
  options,
  selectedOptions,
  onChange,
  label,
  optional,
  name,
  error,
  noOptSelectedTxt,
  enableSelectAll,
  enableSearch,
  isDisabled
}) => {

    let field;
    try {
      const fieldInfo = useField(name);
      field = fieldInfo[0];
    } catch (e) {
      field = false;
    }

  const [isSelectAll, setIsSelectAll] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [search,setSearch]=useState("")
  const selectRef = useRef<any>();

  const handleClickOutside = (event: any) => {
    if (selectRef.current) {
      if (!selectRef.current?.contains(event.target)) {
        setMenuIsOpen(false);
      } else {
        setMenuIsOpen(true);
      }
    }
  };

  const handleSelectChange = (
    selected: ValueType<OptionType, true>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    const selectedArray = ((selected as OptionType[]) || []).filter(
      (option) => option.value !== "selectAll"
    );

    const isSelectAllTriggered =
      (actionMeta.action === "select-option" ||
        actionMeta.action === "deselect-option") &&
      actionMeta?.option?.value === "selectAll";

    const allOptionsSelected = selectedArray.length === options.length;

    if (isSelectAllTriggered) {
      if (allOptionsSelected) {
        setIsSelectAll(false);
        onChange([]);
      } else {
        setIsSelectAll(true);
        onChange(options.filter((option) => option.value !== "selectAll"));
      }
    } else {
     if(enableSelectAll) setIsSelectAll(selectedArray.length === options.length);
      onChange(selectedArray);
    }
  };

  useEffect(() => {
   if(enableSelectAll){ setIsSelectAll(
      selectedOptions.length === 0
        ? false
        : selectedOptions.length === options.length
    )};
  }, [options,enableSelectAll]);



    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

  const modifiedOptions = [
    ...(enableSelectAll? [
    {
      label: "Select All/Unselect All",
      value: "selectAll",
      isSelected: isSelectAll,
    },
  ]:[]),
    ...options.filter((option) => option.value !== "selectAll"),
  ];

  const modifiedSelectedOptions = [
    ...((isSelectAll && enableSelectAll)
      ? [
          {
            label: "Select All/Unselect All",
            value: "selectAll",
            isSelected: isSelectAll,
          },
        ]
      : []),
    ...selectedOptions,
  ];

  const WrappedValueContainer = (customProps: any) => {
    return (props: any) => <CustomValueContainer {...props} {...customProps} />;
  };

  const customStyles = {
    indicatorSeparator: (base: any) => ({
      ...base,
      display: 'none', // Remove the separator
    }),
    dropdownIndicator: (provided:any) => ({
      ...provided,
      padding: '8px',
    }),
    control: (provided:any) => ({
      ...provided,
      padding: "0px 16px",
      minHeight: "48px"
    }),
    // ... any other custom styles if needed
  }

  return (
    <Row className={"mt-2"}>
          {label && <LabelCol md={12} className="field-label">
        {label} {optional && <OptionalTag>{` (optional)`}</OptionalTag>}
      </LabelCol>}
      <Col md={12}>
    <Form.Group ref={selectRef}>
      <StyledSelect
        menuIsOpen={Boolean(isDisabled) ? false : menuIsOpen}
        onMenuOpen={() => !isDisabled && setMenuIsOpen(true)}
        onMenuClose={() => !isDisabled && setMenuIsOpen(false)}
        options={filterOptions(modifiedOptions,search)}
        value={[
          ...((isSelectAll && enableSelectAll)
            ? [
                {
                  label: "Select All/Unselect All",
                  value: "selectAll",
                  isSelected: isSelectAll,
                },
              ]
            : []),
          ...selectedOptions,
        ]}
        onChange={handleSelectChange}
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        components={{ Option: CustomOption ,ValueContainer: WrappedValueContainer({ noOptSelectedTxt, enableSelectAll, showSearch: menuIsOpen && enableSearch, search, setSearch }) }}
        isOptionSelected={(option: { value: string; }) =>
          modifiedSelectedOptions.some(({ value }) => value === option.value)
        }
        styles={customStyles}
        isDisabled={isDisabled}
      />
       {field && (
            <ErrorMessage className="text-danger" name={name} component="div" />
          )}
          {error && <p className="text-danger">{error}</p>}
    </Form.Group>
    </Col>
    </Row>
  );
};

CheckboxSelector.defaultProps={
  noOptSelectedTxt:'No options selected',
  enableSelectAll: true,
  enableSearch: false
}

export default CheckboxSelector;
