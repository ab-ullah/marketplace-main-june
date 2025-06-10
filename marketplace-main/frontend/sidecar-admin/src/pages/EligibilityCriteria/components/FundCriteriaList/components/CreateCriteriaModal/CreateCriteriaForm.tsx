import React, {FunctionComponent} from 'react';

import "react-datepicker/dist/react-datepicker.css";
import filter from "lodash/filter";
import map from "lodash/map";
import flatten from "lodash/flatten";
import includes from "lodash/includes";
import getValues from "lodash/values";
import {useHistory} from "react-router-dom";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import {ErrorMessage, Formik} from "formik";
import {INITIAL_VALUES, VALIDATION_SCHEMA} from "./constants";

import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import {StyledForm} from "./styles";
import {useAppDispatch, useAppSelector} from "../../../../../../app/hooks";
import {selectGeoSelector} from "../../../../selectors";
import Select from "react-select";
import {ISelectOption} from "../../../../../../interfaces/form";
import API from "../../../../../../api"
import {getFundEligibilityCriteria} from "../../../../thunks";
import {IFundBaseInfo, IFundDetail} from "../../../../../../interfaces/fundDetails";
import {IEligibilityCriteria} from "../../../../../../interfaces/EligibilityCriteria/criteria";
import {ADMIN_URL_PREFIX} from "../../../../../../constants/routes";
import { StyledSwitch } from '../../../../../../presentational/forms';
import { get } from 'lodash';
import { logMixPanelEvent } from '../../../../../../utils/mixPanel';


interface CreateCriteriaFormProps {
  fund: IFundDetail | IFundBaseInfo;
  criteria?: IEligibilityCriteria;
  closeModal: () => void;
}


const CreateCriteriaForm: FunctionComponent<CreateCriteriaFormProps> = ({fund, criteria, closeModal}) => {
  const geoSelector = useAppSelector(selectGeoSelector)
  const dispatch = useAppDispatch()
  const history = useHistory();

  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true);
    const payload = {
      name: values.formName,
      description: values.description,
      country_region_codes: values.country.map((country: ISelectOption) => country.value),
      is_smart_criteria: values.isSmartViewEnabled,
      fund: fund.id,
    }
    let resp: any = {};
    if(criteria && criteria?.id) {
      resp = await API.updateFundCriteria(criteria?.id, payload)
      setSubmitting(false);
      closeModal()
      dispatch(getFundEligibilityCriteria(fund.id))
    } else {
      resp = await API.createEligibilityCriteria(payload);
      logMixPanelEvent("Created eligibility criteria");
      setSubmitting(false);
      closeModal()
      dispatch(getFundEligibilityCriteria(fund.id))
      history.push(`/${ADMIN_URL_PREFIX}/eligibility/${resp.id}/edit`);
    }
  }

  const getCriteriaInitialValues = (criteria: IEligibilityCriteria) => {
    const selectedCountry = flatten(getValues(criteria?.selected_region_country_codes))
    const country = filter(flatten(map(geoSelector, 'options')), (option) => includes(selectedCountry, option.value));
    const isSmartViewEnabled = get(criteria, 'is_smart_view')
    return {
      country,
      isSmartViewEnabled
    }
  }

  return <Container fluid>
    <Col>
      <Formik
        initialValues={criteria ? getCriteriaInitialValues(criteria) : INITIAL_VALUES}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={onSubmit}
      >
        {({
            values,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue
          }) => (
          <StyledForm onSubmit={handleSubmit}>
            <Form.Group controlId="country">
              <Form.Label>Which country(ies) do you wish to create eligibility for?</Form.Label>
              <Select
                onChange={(value: any) => setFieldValue('country', value)}
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                isMulti={true}
                value={values.country}
                name={'country'}
                // @ts-ignore
                options={geoSelector}
                onBlur={handleBlur}
              />
              <span className="text-danger"><ErrorMessage name="country" /></span>
            </Form.Group>
            {!criteria?.id && <StyledSwitch
              id="smart-flow-toggle"
              className="m-2"
              label="Enable smart view"
              variant="sm"
              type="switch"
              onChange={(e: any) => setFieldValue('isSmartViewEnabled', get(e, 'target.checked'))}
              onBlur={handleBlur}
              value={values.isSmartViewEnabled}
              checked={values.isSmartViewEnabled}
              />}
            <Button type="submit" disabled={isSubmitting} className={'create'}>
              {criteria?.id ? "Update" : "Next"}
            </Button>
            <Button disabled={isSubmitting} className={'cancel'} onClick={closeModal}>
              Cancel
            </Button>
          </StyledForm>
        )}
      </Formik>
    </Col>
  </Container>;
};

export default CreateCriteriaForm;
