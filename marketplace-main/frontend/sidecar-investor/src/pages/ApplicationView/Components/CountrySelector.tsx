import React, {FunctionComponent, useState} from 'react';
import API from "../../../api";
import {useAppSelector} from '../../../app/hooks';
import {selectCountries} from '../../EligibilityCriteria/selectors';
import SelectorField from '../../../components/Form/SelectorField';
import {selectKYCRecord} from '../../KnowYourCustomer/selectors';
import {useHistory, useParams} from 'react-router-dom';
import {INVESTOR_URL_PREFIX} from "../../../constants/routes";
import {MODIFY_ELIGBILITY} from "../../../constants/urlHashes";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalHeader from "react-bootstrap/ModalHeader";
import {ModalFooter} from "react-bootstrap";
import get from "lodash/get";
import { useCompanyPrefix } from '../../../utils/hooks';
import { useGetOnboardingCustomTextQuery } from '../../../api/rtkQuery/pageConfigsApi';

interface CountrySelectorProps {
  values: any;
  disabled?: boolean;
  isAllocationApproved: boolean;
}


const CountrySelector: FunctionComponent<CountrySelectorProps> = ({values, disabled, isAllocationApproved}) => {
  const {externalId} = useParams<{ externalId: string }>();
  const {companyPrefix} =useCompanyPrefix()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [countryId, setCountryId] = useState<string | null>(null)
  const countries = useAppSelector(selectCountries)
  const history = useHistory();
  const {
    answers,
    kycRecordId,
    workflow,
  } = useAppSelector(selectKYCRecord);

  const {data: onboardingCustomText} = useGetOnboardingCustomTextQuery(undefined);


  const handleCountryChange = (value: any) => {
    if (get(answers, 'investor_location', '') === value.id) return
    setCountryId(value.id)
    setShowModal(true)
  }

  const saveCountry = async () => {
    if (!countryId) return

    const payload = {
      investor_location: countryId,
      fund_external_id: externalId
    }
    await API.updateKYCRecord(workflow!.slug, kycRecordId!, payload);
    history.push(`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${externalId}/onboarding${MODIFY_ELIGBILITY}`);
  }

  const handleClose = () => {
    setCountryId(null);
    setShowModal(false)
  }

  return <>
    <SelectorField
      label={onboardingCustomText?.custom_domicile_text ?? 'Where were you when you decided to invest?'}
      name={'whereWereYouWhenYouDecidedToInvest'}
      placeholder={''}
      onChange={handleCountryChange}
      value={values.whereWereYouWhenYouDecidedToInvest}
      options={countries}
      disabled={disabled || isAllocationApproved}
    />
    <Modal size={'lg'} show={showModal} onHide={handleClose}>
      <ModalHeader closeButton>
        <Modal.Title>Update Country</Modal.Title>
      </ModalHeader>
      <Modal.Body>
        If you change your country selection, we will need to ask you new eligibility questions required for your
        new country selection. Are you sure you would like to change your country and re-verify eligibility?
      </Modal.Body>
      <ModalFooter>
        <Button onClick={saveCountry}>Yes</Button>
        <Button onClick={handleClose}>No</Button>
      </ModalFooter>
    </Modal>
  </>
};

export default CountrySelector;
