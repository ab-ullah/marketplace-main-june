import React, {FunctionComponent, useEffect, useState} from 'react';
import API from '../../../../api'
import {useHistory} from "react-router-dom";
import {BUSINESS_LINE_OPTIONS, FUND_TYPE_OPTIONS, INVITE_TYPE_OPTIONS, LEVERAGE_TYPE_OPTIONS} from '../../../Funds/components/CreateFund/constants';
import {ADMIN_URL_PREFIX} from "../../../../constants/routes";
import { IFundDetailExtended } from '../../interfaces';
import { IFundBaseInfo } from '../../../../interfaces/fundDetails';
import {ICurrency} from "../../../../interfaces/currency";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import CreateFundForm from '../../../Funds/components/CreateFund/CreateFundForm';
import {Button} from './styles';
import {selectFundDetail} from "../../../FundDetail/selectors";
import Modal from "react-bootstrap/Modal";

interface FundSetupProps {
    fund: IFundBaseInfo
}

const FundSetup: FunctionComponent<FundSetupProps> = ({fund}) => {
    const [fundWithFields, setFundWithFields] = useState<IFundDetailExtended | undefined>();
    const fundDetails = useAppSelector(selectFundDetail);
    const [showModal, setShowModal] = useState<boolean>(false);

    const closeModal = () => setShowModal(false);


    useEffect(() => {
        const setSelectors = async () => {
            if (!fundDetails) return;
            const currencies = await API.getCurrencies()

            const getCurrencyOption = (currencyId: number) => {
                const currency = currencies.find((currency: ICurrency) => currency.id === currencyId)
                return currency && { value: currency.id, label: currency.code }
            }
            const getInviteOption = (isInviteOnly: boolean) => {
                const val = isInviteOnly ? 1 : 0;
                return INVITE_TYPE_OPTIONS.find((option: any) => val === option.value);
            }
            const getOfferLeverageOption = (isOfferedLeverage: boolean) => {
                const val = isOfferedLeverage ? 1 : 0;
                return LEVERAGE_TYPE_OPTIONS.find((option: any) => val === option.value);
            }
            const fundForForm: IFundDetailExtended = Object.assign({}, fundDetails, {
                "fund_type_selector": FUND_TYPE_OPTIONS.find(option => option.value === fundDetails.fund_type),
                "business_line_selector": BUSINESS_LINE_OPTIONS.find(option => option.label === fundDetails.business_line_name),
                "currency_selector": getCurrencyOption(fundDetails.fund_currency),
                "is_invite_only": getInviteOption(fundDetails.is_invite_only),
                "offer_leverage": getOfferLeverageOption(fundDetails.offer_leverage),
            });
            
            setFundWithFields(fundForForm);
        }
        setSelectors()
    }, [fundDetails])
    
    if (!fundWithFields || !fundDetails) return <></>

    return <>
        <Button onClick={() => setShowModal(true)} variant={'primary'} className={"mb-3"}>Fund Setup</Button>
        <Modal size={'lg'} show={showModal} onHide={closeModal}>
            <Modal.Header closeButton>
                <Modal.Title>Fund Setup</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CreateFundForm fund={fundWithFields} closeModal={closeModal} />
            </Modal.Body>
        </Modal>
    </>;
}


export default FundSetup;