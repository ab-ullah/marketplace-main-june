import { useEffect, useMemo, useState } from "react";
import API from "../../../../../../../../api/backendApi";
import { PLAN_ID_PARAM } from "../../../../../../constants";
import { isEmpty, map } from "lodash";
import VestingScheduleDisplay from "../../../../../VestingScheduleDisplay";
import { Col, Row } from "react-bootstrap";
import { SubTitle } from "../../../../../styles";
import { Description, MilestoneName, NoMilestones, VestingPercentageCont } from "./styles";
import { generateDateWithOffset, standardizeDateForApi } from "../../../../../../../../utils/dateFormatting";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField";
import _ from "lodash";
import { isValidPositiveDecimal } from "../../../../../../../../utils/getValue";
import useWindowDimensions from "../../../../../../../../utils/WindowDimentions";
import FormDateField from "../../../../../../../../components/Form/DateField";

const VestingSection = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const carryPlanId = searchParams.get(PLAN_ID_PARAM);

  const [state, setState] = useState<Record<string, any> | null>(null);
  const [milestonePercentages, setMilestonePercentages] = useState<Record<string,any>>({})

  const {breakpoint} = useWindowDimensions()

  const handleFetchCarryPlanVestingSchedules = async () => {
    const res = await API.fetchCarryPlanVestingSchedules(carryPlanId as string);
    if (res.success) {
      setState(res.data);
      const percentages:Record<string,any>={}
      res.data.carry_plan_milestones.forEach((milestone:any)=>percentages[milestone.id]=milestone.vesting_percentage)
      setMilestonePercentages(prev=>{
        return Object.keys(prev).length===0 ?  percentages : prev})
    }
  };

  const handleUpdateMilestoneDate = async (
    milestoneId: number,
    date: string
  ) => {
    const res = await API.updateCarryPlanMilestoneDate({
      milestone_id: milestoneId,
      date: standardizeDateForApi(date),
      carry_plan_id: Number(carryPlanId),
    });
    if (res.success) {
      handleFetchCarryPlanVestingSchedules();
    }
  };

  const handleUpdateMilestonePercentage = async (
    milestoneId: number,
    vesting_percentage: string
  ) => {
    const res = await API.updateCarryPlanMilestoneDate({
      milestone_id: milestoneId,
      vesting_percentage:vesting_percentage ||0 ,
      carry_plan_id: Number(carryPlanId),
    });
    if (res.success) {
      handleFetchCarryPlanVestingSchedules();
    }
  };

  const handleChangeMilestonePercentagesLocal =(milestoneId:any,percentage:any)=>{
    setMilestonePercentages((prev)=>({...prev,[milestoneId]:percentage}))

    if(percentage){
      debouncedOnChangePercentage(milestoneId,percentage)
    }
  }

  const debouncedOnChangePercentage = useMemo(
    () => _.debounce(handleUpdateMilestonePercentage, 500)
    , []);

  useEffect(() => {
    if (carryPlanId) handleFetchCarryPlanVestingSchedules();
  }, [carryPlanId]);

  return (
    <div>
      <Row>
        <Col lg={12} xl={6}>
          <SubTitle>Vesting Schedules</SubTitle>
          {map(state?.vesting_schedules, (schedule) => (
            <VestingScheduleDisplay data={schedule} textLimit={breakpoint==='xl' ? 22: 40}/>
          ))}
        </Col>
        <Col lg={12} xl={6}>
          <SubTitle>Milestones</SubTitle>
          <Description>Set milestone dates to advance vesting</Description>
          {isEmpty(state?.carry_plan_milestones) ? (
            <NoMilestones>
              <p>No milestones in vesting schedules</p>
            </NoMilestones>
          ) : (
            map(state?.carry_plan_milestones, (milestone) => (
              <div className="d-flex justify-content-between">
                <MilestoneName className="mt-2">
                  {milestone?.name}
                </MilestoneName>
                <div className="d-flex align-items-baseline">
                  <FormDateField
                    onChange={(value: any) => handleUpdateMilestoneDate(milestone.id, value)}
                    value={milestone.date
                      ? generateDateWithOffset(milestone.date)
                      : null}
                    label="Date"
                    />
                <VestingPercentageCont>
                <FormTextFieldRow
                  label="%"
                  placeholder=""
                  name="vesting_percentage"
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (
                      (isValidPositiveDecimal(val) && Number(val) <= 100) ||
                      val === ""
                    )
                    handleChangeMilestonePercentagesLocal(milestone.id, e.target.value);
                  }}
                  value={milestonePercentages[milestone.id]}
                  error={milestonePercentages[milestone.id] ? "" :"Required"}
                />
                </VestingPercentageCont>
                </div>
              </div>
            ))
          )}
        </Col>
      </Row>
    </div>
  );
};

export default VestingSection;
