import React, { FunctionComponent } from 'react';
import { useParams, useHistory } from "react-router-dom";
import { IApplicationStatus } from "../../interfaces/application";
import {useGetApplicationStatusQuery, useGetFundDetailsQuery, useGetFundPermissionStatusQuery} from "../../api/rtkQuery/fundsApi";
import ConfirmationComponent from "./Confirmation";
import {IFundDetail} from "../../interfaces/fundDetails";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Wrapper, H1, H3 } from "../StartPage/styles";
import { INVESTOR_URL_PREFIX } from '../../constants/routes';

interface IConfirmation {
    redirectUrl: string;
    callbackSubmitPOA?: () => void;
}


export const hasOnBoardingPermission = (Content: React.ComponentType) => {

    const Confirmation: FunctionComponent<IConfirmation> = ({ redirectUrl, ...restProp }) => {
        let { externalId } = useParams<{ externalId: string }>();
        const { data: applicationStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
        const history = useHistory();
        const canGoPastEligibility = applicationStatus?.can_go_past_eligibility;

        if(!applicationStatus)
            return (<></>)
        if(applicationStatus.is_locked){
            history.push(`/${INVESTOR_URL_PREFIX}/funds/${externalId}/application`)
        }
        if(canGoPastEligibility)
            return (<Content {...restProp} />);

        return (<ConfirmationComponent  showNext={canGoPastEligibility} handleClickNext={() => history.push(redirectUrl)}  />);
    };

    return Confirmation;
}



export const hasKycPermission = (Content: React.ComponentType) => {

    const Confirmation: FunctionComponent<IConfirmation> = ({ redirectUrl }) => {
        let { externalId } = useParams<{ externalId: string }>();
        const { data: applicationStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
        const history = useHistory();
        const canViewAgreements = applicationStatus?.can_view_agreements
        if(!applicationStatus)
            return (<></>)
        if(applicationStatus.is_locked){
            history.push(`/${INVESTOR_URL_PREFIX}/funds/${externalId}/application`)
        }
        if(canViewAgreements)
            return (<Content />);

        return (<ConfirmationComponent  showNext={canViewAgreements} handleClickNext={() => history.push(redirectUrl)}  />);
    };

    return Confirmation;
}

export const canViewFund = (Content: React.ComponentType) => {

    const Confirmation: FunctionComponent<IConfirmation> = ({ redirectUrl }) => {
        let { externalId } = useParams<{ externalId: string }>();
        const { data: permission } = useGetFundPermissionStatusQuery<{ data: any }>(externalId);
        const history = useHistory();
        
        if(!permission)
            return <></>

        if(permission.status)
            return <Content />;

        return (
            <Wrapper fluid hasLoader={true}>
              <Row>
                <Col className="text-center">
                  <H1 >404</H1>
                  <H3>Page Not Found</H3>
                </Col>
              </Row>
            </Wrapper>
          );
    };

    return Confirmation;
}

