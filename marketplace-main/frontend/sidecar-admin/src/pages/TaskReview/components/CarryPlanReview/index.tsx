import { ITaskDetail } from "../../../../interfaces/Workflow/task";
import API from "../../../../api/backendApi";
import { BigTitle, ButtonRow, Container, Header, HeaderRow, StyledLink } from "./styles";
import { useEffect, useState } from "react";
import { formatFundCarryPlanAndAllocations } from "../../../CarryManagement/components/CarryPlansPage/constants";
import CarryPlanDetailView from "../../../CarryManagement/components/CarryPlansPage/components/CarryPlanDetailView";
import { isEmpty } from "lodash";
import { TabsContainer } from "../../../CarryManagement/styles";
import NotificationModal from "../../../../components/NotificationModal";
import { notificationConfig } from "./constants";
import { INotificationConfig } from "../../../KnowYourCustomer/interfaces";
import ApproveButton from "../../../../components/ReviewActionButtons/ApproveButton";
import { CHANGES_REQUESTED, PENDING } from "../../../../constants/taskStatus";
import { ArrowBack } from '@material-ui/icons';
import { PLAN_ID_PARAM, TABS } from "../../../CarryManagement/constants"
import { useGetCarryHurdleFlagQuery } from "../../../../api/rtkQuery/commonApi";

interface ICarryPlanReviewProps {
  task: ITaskDetail;
}

const CarryPlanReview = ({ task }: ICarryPlanReviewProps) => {
  const {data: carryHurdleFlag} = useGetCarryHurdleFlagQuery()
  const hurdleEnabled = Boolean(carryHurdleFlag?.is_active)
  const [carryPlanDetail, setCarryPlanDetail] = useState<Record<string, any>>(
    {}
  );
  const [notification, setNotification] = useState<INotificationConfig>(
    notificationConfig.default
  );

  const [top, setTop] = useState(0);

  const handleFetchCarryPlanAndAllocations = async (planId: string) => {
    const res = await API.fetchCarryPlanAndAllocations(planId);
    if (res.success) {
      setCarryPlanDetail(formatFundCarryPlanAndAllocations(res.data,true));
    }
  };

  useEffect(() => {
    const mainNav = document.getElementById("main-nav");
    setTop(mainNav?.offsetHeight || 0);
  }, []);

  useEffect(() => {
    if (task.carry_plan_id)
      handleFetchCarryPlanAndAllocations(task.carry_plan_id?.toString());
  }, [task]);

  if (isEmpty(carryPlanDetail))
    return <Container>Loading Carry Details</Container>;

  return (
    <TabsContainer fluid top={top}>
      <Header>
        <HeaderRow>
          <div>
          <BigTitle>{carryPlanDetail?.name}</BigTitle>
          <p>Review requested by {task.responsible}</p>
          <StyledLink to={`/admin/carryManagement?tab=${TABS.CARRY_PLANS}&${PLAN_ID_PARAM}=${task.carry_plan_id}`}><ArrowBack /> Back to Carry Plan</StyledLink>
          </div>
        </HeaderRow>
        <HeaderRow>
          <ButtonRow>
            {(task.status === PENDING || task.status === CHANGES_REQUESTED) && (
              <ApproveButton
                taskId={task.id}
                showNotification={() =>
                  setNotification(notificationConfig.approve)
                }
              />
            )}
          </ButtonRow>
        </HeaderRow>
      </Header>
      <div style={{ padding: "37px 80px", background:'#ECEFF1' }}>
        <CarryPlanDetailView carryPlanDetail={carryPlanDetail} hurdleEnabled={hurdleEnabled}/>
      </div>
      <NotificationModal
        title={notification?.title}
        showModal={notification?.show}
        handleClose={() => setNotification(notificationConfig.default)}
      >
        {notification?.msg}
      </NotificationModal>
    </TabsContainer>
  );
};

export default CarryPlanReview;
