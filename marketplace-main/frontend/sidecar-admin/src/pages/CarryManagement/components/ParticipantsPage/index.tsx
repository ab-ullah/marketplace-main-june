import { Breadcrumb } from "react-bootstrap";
import { PageContainer, Title, TopRow } from "../styles";
import ParticipantsListView from "./components/ParticipantsListView";
import ParticipantDetailView from "./components/ParticipantDetailView";
import { useEffect, useState } from "react";
import { PARTICIPANT_ID_PARAM, PARTICIPANT_NAME_PARAM } from "../../constants";
import NavableLoader from "../../../../components/NavableLoader";

const ParticipantsPage = () => {
  const [participantToView, setParticipantToView] = useState<{
    id?: string | null;
    name?: string | null;
  }>({});
  
  const [isLoading, setIsLoading] = useState(true);
  
  const handleSelectParticipant = (id: string, name: string) => {
    setParticipantToView({id, name});
  };

  const resetParticipantParam = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(PARTICIPANT_ID_PARAM);
    searchParams.delete(PARTICIPANT_NAME_PARAM)
    window.history.replaceState({}, "", `?${searchParams.toString()}`);
    setParticipantToView({});
  };

  const handleParticipantName=(name:string)=>{
    setParticipantToView(prev=>({...prev,name}))
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsFund = searchParams.get(PARTICIPANT_ID_PARAM);
    const paramsParticipantName = searchParams.get(PARTICIPANT_NAME_PARAM)

    if(paramsParticipantName && !participantToView.name){
      handleParticipantName(paramsParticipantName)
    }

    if (paramsFund && paramsFund !== participantToView.id) {
      setParticipantToView(prev=>({...prev,id:paramsFund}))
    } else if (!paramsFund && participantToView.id) {
      searchParams.set(PARTICIPANT_ID_PARAM, participantToView.id);
      participantToView.name && searchParams.set(PARTICIPANT_NAME_PARAM, participantToView.name);
      window.history.replaceState({}, "", `?${searchParams.toString()}`);
    }

    setIsLoading(false);
  }, [participantToView.id]);

  if (isLoading) return <NavableLoader />

  return (
    <PageContainer>
      <TopRow>
        <Title>{participantToView.name ? participantToView.name : 'Participants'}</Title>
      </TopRow>
      <Breadcrumb>
        {["Carry Management", "Participants", participantToView.name]
          .filter((elem) => elem)
          .map((elem, i) => (
            <Breadcrumb.Item
              onClick={() => (i === 1 ? resetParticipantParam() : null)}
              key={elem}
            >
              {elem}
            </Breadcrumb.Item>
          ))}
      </Breadcrumb>
      {!participantToView.id ? (
        <ParticipantsListView
          selectParticipantToView={handleSelectParticipant}
        />
      ) : (
        <ParticipantDetailView
          participantId={participantToView.id}
          handleParticipantName={handleParticipantName}
          goBack={resetParticipantParam}
        />
      )}
    </PageContainer>
  );
};

export default ParticipantsPage;
