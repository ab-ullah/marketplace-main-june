import { Breadcrumb } from "react-bootstrap";
import { PageContainer, Title, TopRow } from "../styles";
import { useState } from "react";
import VestingListView from "./components/VestingListView";
import VestingDetailModal from "./components/VestingDetailModal";

const VestingPage = () => {
  const [scheduleToView, setScheduleToView] = useState<null | number>(null);

  const handleCloseModal = () => {
    setScheduleToView(null);
  };

  const handleSelectScheduleToView = async (scheduleId: number) => {
    setScheduleToView(scheduleId);
  };
  return (
    <PageContainer>
      <TopRow>
        <Title>Vesting Schedules</Title>
      </TopRow>
      <Breadcrumb>
        {["Carry Management", "Vesting"].map((elem) => (
          <Breadcrumb.Item>{elem}</Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <VestingListView selectScheduleToView={handleSelectScheduleToView} />
      {scheduleToView && (
        <VestingDetailModal
          handleCloseModal={handleCloseModal}
          scheduleId={scheduleToView}
        />
      )}
    </PageContainer>
  );
};

export default VestingPage;
