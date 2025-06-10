import {FunctionComponent, useEffect, useState} from 'react';
import {fetchGeoSelector} from "../../../../../../thunks";
import {useAppDispatch, useAppSelector} from "../../../../../../../../app/hooks";
import {selectGeoSelector} from "../../../../../../selectors";
import Form from "react-bootstrap/Form";
import Select from "react-select";


interface CountrySelectorProps {
  isDisabled?: boolean;
  label?: string;
  defaultValue?: any[];
  handleChange?: (data: any) => void;
}


const CountrySelector: FunctionComponent<CountrySelectorProps> = ({ label, defaultValue, isDisabled, handleChange }) => {
  const [selectedCountries, setSelectedCountries] = useState<any[]>([]);
  const dispatch = useAppDispatch()
  const geoSelector = useAppSelector(selectGeoSelector)
  useEffect(() => {
    dispatch(fetchGeoSelector())
  }, [dispatch])

  const onChange = (value: any) => {
    setSelectedCountries(value)
    if(handleChange)
      handleChange(value);
  }

  useEffect(() => {
    if(defaultValue)
      setSelectedCountries(defaultValue);
  }, [defaultValue])


  return <div>
    {label && (
      <h4>Select your country</h4>
    )}
    <Form>
      <Form.Group controlId="country">
        <Select
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          isMulti={true}
          isDisabled={isDisabled}
          value={selectedCountries}
          name={'country'}
          // @ts-ignore
          options={geoSelector}
          onChange={onChange}
        />
      </Form.Group>
    </Form>
  </div>
};

CountrySelector.defaultProps = {
  label: "Select your country<",
  isDisabled: false
}

export default CountrySelector;
