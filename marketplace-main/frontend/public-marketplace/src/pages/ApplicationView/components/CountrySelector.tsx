import React, {FunctionComponent, useState} from 'react';
import API from "../../../api/marketplaceApi";
import {useAppSelector} from '../../../app/hooks';
import {selectGeoSelector} from '../../TaxForms/selectors';
import SelectorField from '../../../components/SelectorField';
import {selectKYCRecord} from '../../KnowYourCustomer/selectors';
import {useNavigate, useParams} from 'react-router-dom';
import {MODIFY_ELIGBILITY} from "../../../constants/urlHashes";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ModalHeader from "react-bootstrap/ModalHeader";
import {ModalFooter} from "react-bootstrap";
import get from "lodash/get";

interface CountrySelectorProps {
  values: any;
  isAllocationApproved: boolean;
}


const CountrySelector: FunctionComponent<CountrySelectorProps> = ({values, isAllocationApproved}) => {
  const {externalId, company} = useParams<{ externalId: string, company: string }>();
  const [showModal, setShowModal] = useState<boolean>(false)
  const [countryId, setCountryId] = useState<string | null>(null)
  const countries = useAppSelector(selectGeoSelector)
  const history = useNavigate();
  const {
    answers,
    kycRecordId,
    workflow,
  } = useAppSelector(selectKYCRecord);


  const handleCountryChange = (value: any) => {
    if (get(answers, 'investor_location', '') === value.id) return
    setCountryId(value.id)
    setShowModal(true)
  }

  const saveCountry = async () => {
    if (!countryId) return

    const payload = {
      investor_location: countryId
    }
    await API.updateKYCRecord(workflow!.slug, kycRecordId!, payload);
    history(`/${company}/opportunity/${externalId}/onboarding${MODIFY_ELIGBILITY}`);
  }

  const handleClose = () => {
    setCountryId(null);
    setShowModal(false)
  }

  return <>
    <SelectorField
      label={'Where were you when you decided to invest?'}
      name={'whereWereYouWhenYouDecidedToInvest'}
      placeholder={''}
      onChange={handleCountryChange}
      value={values.whereWereYouWhenYouDecidedToInvest}
      //@ts-ignore
      options={countries}
      disabled={isAllocationApproved}
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
