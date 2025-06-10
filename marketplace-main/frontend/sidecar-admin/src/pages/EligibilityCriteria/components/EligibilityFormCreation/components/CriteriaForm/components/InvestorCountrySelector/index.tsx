import { FunctionComponent } from "react";
import { useParams } from "react-router-dom";
import { eligibilityConfig } from "../../../../utils/EligibilityContext";
import flatten from "lodash/flatten";
import getValues from "lodash/values";
import "react-datepicker/dist/react-datepicker.css";
import CountrySelector from "../CountrySelector";
import API from "../../../../../../../../api";
import { useAppSelector } from "../../../../../../../../app/hooks";
import { selectSelectedCriteriaDetail, selectGeoSelector } from "../../../../../../../EligibilityCriteria/selectors";
import { filter, includes, map } from "lodash";

const InvestorCountry: FunctionComponent<any> = ({allowEdit}) => {
  const { criteriaId } = useParams<{ criteriaId: string }>();
  const geoSelector = useAppSelector(selectGeoSelector)
  const selectedCriteriaDetail: any = useAppSelector(
    selectSelectedCriteriaDetail
  );
  const handleChange = (values: any) => {
    const payload = {
      country_region_codes: values.map((country: any) => country.value),
    };
    API.updateFundCriteria(parseInt(criteriaId), payload);
  };

  const getCountryInitialValues = () => {
    const selectedCountry = flatten(
      getValues(selectedCriteriaDetail?.selected_region_country_codes)
    );
    const country = filter(flatten(map(geoSelector, "options")), (option) =>
      includes(selectedCountry, option.value)
    );
    
    return country;
  };
  
  return (
    <CountrySelector
      label=""
      isDisabled={!allowEdit}
      handleChange={handleChange}
      defaultValue={getCountryInitialValues()}
    />
  );
};

export default eligibilityConfig(InvestorCountry);
