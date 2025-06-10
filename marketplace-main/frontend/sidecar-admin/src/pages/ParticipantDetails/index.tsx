import React, { useEffect, useMemo, useState } from 'react';
import API from '../../api/backendApi';
import { Container } from '../Participants/styles';
import { Heading, TabContainer } from './styles';
import { Breadcrumb, Tabs, Tab } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom';
import ParticipantProfile from './components/ParticipantProfile';
import ParticipantEntity from './components/ParticipantEntity';
import { KYC_INDIVIDUAL_INVESTOR } from '../KnowYourCustomer/constants';
import { selectGeoSelector } from '../EligibilityCriteria/selectors';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchGeoSelector } from '../EligibilityCriteria/thunks';
import NavableLoader from '../../components/NavableLoader';
import { PARTICIPANT_NAME_PARAM } from './constants';
import { AxiosError } from 'axios';
import {useGetCurrenciesQuery} from "../../api/rtkQuery/commonApi";

const ParticipantDetails = () => {
    const history = useHistory();
    const dispatch = useAppDispatch();
    const { participantId } = useParams<any>()
    const searchParams = new URLSearchParams(window.location.search);
    const participantName = searchParams.get(PARTICIPANT_NAME_PARAM);
    const [, countries] = useAppSelector(selectGeoSelector)
    const { data: currencies } = useGetCurrenciesQuery({});
    const [participantKycRecord, setParticipantKycRecord] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<any>(null);
    
    const fetchParticipantDetail = async () => {
        if(!participantKycRecord) setIsLoading(true);
        try {
            const data = await API.fetchParticipantDetail(participantId);
        setParticipantKycRecord(data);
        }
        catch (e) {
            const error = e as AxiosError
            if (error.response?.data && error.response.status === 404) {
                setErrorMessage('User not found');
            }
            else {
                setErrorMessage('Unable to fetch participant details');
            }
        }
        finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        dispatch(fetchGeoSelector());
        fetchParticipantDetail();
    }, [])

    const individualKycRecord = useMemo(() => {
        return participantKycRecord?.find((record: any) => record.kyc_investor_type_name === KYC_INDIVIDUAL_INVESTOR)
    }, [participantKycRecord])

    const entityKycRecord = useMemo(() => {
        return participantKycRecord?.filter((record: any) => record.kyc_investor_type_name !== KYC_INDIVIDUAL_INVESTOR)
    }, [participantKycRecord])

    if(isLoading || !countries?.options) return <NavableLoader />

    if(participantKycRecord.length === 0 && errorMessage) return <Container>
        <p>{errorMessage}</p>
    </Container>
    

    return <Container>
    {
        individualKycRecord ? <Heading>{individualKycRecord.first_name} {individualKycRecord.last_name}</Heading> :
        <Heading>{participantName}</Heading>
    }
    <Breadcrumb>
    <Breadcrumb.Item onClick={() =>  history.push('/admin/participants')}>
        Participants
    </Breadcrumb.Item>
    <Breadcrumb.Item>
    {individualKycRecord ? <>{individualKycRecord.first_name} {individualKycRecord.last_name}</> : <>{participantName}</>}
    </Breadcrumb.Item>
    </Breadcrumb>
    <TabContainer>
    <Tabs>
        <Tab title="Overview" eventKey="overview">
            <ParticipantProfile 
                record={individualKycRecord} 
                countries={countries?.options}
                currencies={currencies?.map((item: {code: string, name: string, id: number}) => ({
                    value: item.code,
                    label: item.name,
                    id: item.id
                }))}
                refetchData={() => {
                    fetchParticipantDetail()
                }}
                />
            {
                entityKycRecord.length > 0 && entityKycRecord.map((entity: any) => 
                <ParticipantEntity
                    record={entity}
                    countries={countries?.options}
                    currencies={currencies?.map((item: {code: string, name: string, id: number}) => ({
                        value: item.code,
                        label: item.name,
                        id: item.id
                    }))}
                    refetchData={() => {
                        fetchParticipantDetail()
                    }}
                 />)
            }
        </Tab>
    </Tabs>
    </TabContainer>
</Container>
}

export default ParticipantDetails;