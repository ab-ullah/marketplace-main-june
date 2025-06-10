import React, { FC, useEffect, useMemo, useState } from 'react';
import API from '../../../../../../../../api/backendApi'
import {ParticipantCard, TabContainer} from './styles';
import ParticipantCoinvestKYCRecord from './components/ParticipantCoinvestKYCRecord';
import ParticipantEntity from './components/ParticipantEntity';
import { useAppDispatch, useAppSelector } from '../../../../../../../../app/hooks';
import { selectGeoSelector } from '../../../../../../../EligibilityCriteria/selectors';
import { fetchGeoSelector } from '../../../../../../../EligibilityCriteria/thunks';
import { KYC_INDIVIDUAL_INVESTOR } from '../../../../../../../KnowYourCustomer/constants';
import NavableLoader from '../../../../../../../../components/NavableLoader';
import { PARTICIPANT_ID_PARAM } from '../../../../../../constants';
import { AxiosError } from 'axios';
import UserProfile from "./components/UserProfile";
import CarryParticipantProfile from "./components/CarryParticipantProfile";
import EmploymentRecord from "./components/EmploymentRecord";

const ParticipantDetails: FC<any> = ({participantProfile, refetchProfile}) => {
    const dispatch = useAppDispatch();
    const [, countries] = useAppSelector(selectGeoSelector)
    const [KycRecord, setKycRecord] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<any>(null);

    const fetchKyCDetail = async () => {
        const searchParams = new URLSearchParams(window.location.search);
        const participantId = searchParams.get(PARTICIPANT_ID_PARAM);
        if (participantId) {
            if (!KycRecord) setIsLoading(true);
            try {
                const data = await API.fetchCarryParticipantDetail(participantId);
                setKycRecord(data);
            }
            catch (e) {
                const error = e as AxiosError
                if (error.response?.data && error.response.status === 404) {
                    setErrorMessage('User not found');
                }
                else {
                    setErrorMessage('Unable to fetch kyc record details');
                }
            }
            finally {
                setIsLoading(false)
            }
        }
    }


    useEffect(() => {
        dispatch(fetchGeoSelector());
        fetchKyCDetail();
    }, [])

    const individualKycRecord = useMemo(() => {
        return KycRecord?.find((record: any) => record.kyc_investor_type_name === KYC_INDIVIDUAL_INVESTOR)
    }, [KycRecord])

    const entityKycRecord = useMemo(() => {
        return KycRecord?.filter((record: any) => record.kyc_investor_type_name !== KYC_INDIVIDUAL_INVESTOR)
    }, [KycRecord])

    if (isLoading || !countries?.options) return <NavableLoader />

    return <>
        <TabContainer>
            <ParticipantCard>
                <UserProfile record={participantProfile} refetchData={() => { refetchProfile() }}/>
                {participantProfile?.user_carry_participants?.map(
                    (userCarryParticipant: any) => <CarryParticipantProfile record={userCarryParticipant.carry_participant}  refetchData={() => { refetchProfile() }}/>)}
                <EmploymentRecord record={participantProfile} refetchData={() => {
                    refetchProfile();
                    }}/>
                {KycRecord.length !== 0 && !errorMessage &&
                    <ParticipantCoinvestKYCRecord
                        record={individualKycRecord}
                        countries={countries?.options}
                        refetchData={() => {
                            fetchKyCDetail()
                        }}
                    />
                }
                {
                    entityKycRecord.length > 0 && entityKycRecord.map((entity: any) =>
                        <ParticipantEntity
                            record={entity}
                            countries={countries?.options}
                            refetchData={() => {
                                fetchKyCDetail()
                            }}
                        />)
                }
            </ParticipantCard>
        </TabContainer>
    </>
}

export default ParticipantDetails;