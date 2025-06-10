/* eslint-disable import/prefer-default-export */
import React, { FunctionComponent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IApplicationStatus } from 'interfaces/common/applicationStatus'
import { useGetApplicationStatusQuery } from 'api/rtkQuery/fundsApi'
import Loader from 'components/Loader'
import ConfirmationComponent from "./Confirmation";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IConfirmation {
	redirectUrl: string;
	// callbackSubmitPOA?: () => void;
}

export const hasOnBoardingPermission = (Content: React.ComponentType) => {
	const Confirmation: FunctionComponent<IConfirmation> = ({
																														redirectUrl, ...restProp
	}) => {
		const { externalId } = useParams<{ externalId: string }>()
		const { data: applicationStatus } = useGetApplicationStatusQuery<{
			data: IApplicationStatus
		}>(externalId)
		const navigate = useNavigate()
		const { company } =useParams()
		const canGoPastEligibility = applicationStatus?.can_go_past_eligibility;

		if (!applicationStatus) return <Loader />
		if (canGoPastEligibility) return <Content {...restProp} />

		return (<ConfirmationComponent  showNext={canGoPastEligibility} handleClickNext={() => navigate('/'+company+redirectUrl)}  />);
	}

	return Confirmation
}


export const hasKycPermission = (Content: React.ComponentType) => {

	const Confirmation: FunctionComponent<IConfirmation> = ({redirectUrl}) => {
		let { externalId } = useParams<{ externalId: string }>();
		const { data: applicationStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
		const history = useNavigate();
		const { company } =useParams()
		const canViewAgreements = applicationStatus?.can_view_agreements
		if(!applicationStatus)
			return (<></>)
		if(canViewAgreements)
			return (<Content />);

		return (<ConfirmationComponent  showNext={canViewAgreements} handleClickNext={() => history('/'+company+redirectUrl)}  />);
	};

	return Confirmation;
}
