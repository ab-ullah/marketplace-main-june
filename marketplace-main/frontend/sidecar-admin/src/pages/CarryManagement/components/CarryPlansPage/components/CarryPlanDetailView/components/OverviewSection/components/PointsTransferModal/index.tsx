import Modal from "react-bootstrap/Modal";
import { useEffect, useMemo, useState } from "react";
import TrashIcon from "@material-ui/icons/DeleteOutlined";
import { toast } from "react-toastify";
import { SecondaryButton } from "../../../../../../../styles";
import { PLAN_ID_PARAM } from "../../../../../../../../constants";
import API from "../../../../../../../../../../api/backendApi";
import AllocationDatesCard from "../../../AllocationDetails/components/allocationDatesCard";
import { Col, Row } from "react-bootstrap";
import AllocationPointsCard from "../../../AllocationDetails/components/allocationPointsCard";
import VestingSchedule from "../../../AllocationDetails/components/vestingSchedule";
import NavableLoader from "../../../../../../../../../../components/NavableLoader";
import { DeleteIconWrapper, FieldWrapper, StyledRow, AddButton, AllocationsCont } from "./styles";
import { FormTextFieldRow } from "../../../../../../../../../../components/Form/TextField";
import { FormSelectorFieldRow } from "../../../../../../../../../../components/Form/SelectorField";
import FormDateField from "../../../../../../../../../../components/Form/DateField";
import { getSumByProperty, isValidPositiveUncappedDecimal, truncateDecimal } from "../../../../../../../../../../utils/getValue";
import map from "lodash/map";
import {
  createDecimal,
  decimalEqual,
  decimalGreaterThan,
} from "../../../../../../../../../../utils/decimal";
import { get, isEmpty } from "lodash";
import { generateDateTimeWithZeroTime, generateDateWithOffset, standardizeDate } from "../../../../../../../../../../utils/dateFormatting";

interface IPointsTransferModalProps {
  handleCloseModal: () => void;
  selectedAllocation: Record<string, any>;
  refreshData: (plandId: string) => void;
}

const PointsTransferModal = ({
  handleCloseModal,
  selectedAllocation,
  refreshData,
}: IPointsTransferModalProps) => {
  const [allocationDetail, setAllocationDetail] = useState<any>({});
  const [newAllocations, setNewAllocations] = useState<any[]>([]);

  const [vestingSchedulesOptions, setVestingSchedulesOptions] = useState<any[]>(
    []
  );
  const [participantOptions, setParticipantOptions] = useState<any[]>([]);
  const [carryVehicles, setCarryVehicles] = useState<any[] | null>(null);
  const [isLoading, setIsloading] = useState(true);

  const searchParams = new URLSearchParams(window.location.search);
  const planId = searchParams.get(PLAN_ID_PARAM) || '';

  const newAllocationTemplate = useMemo(()=>{
    const {
      name,
      carry_participant_id,
      bps,
      grant_date,
      vesting_start_date,
      share_class,
      sub_pool_id,
      sub_pool_name,
      vehicle,
      vesting_schedule,
    } = selectedAllocation;
    const initialValues = {
      participant: null,
      bps: createDecimal(bps).toString(),
      grant_date: grant_date? standardizeDate(generateDateWithOffset(grant_date).toString()):null,
      vesting_start_date: vesting_start_date? standardizeDate(generateDateWithOffset(vesting_start_date).toString()):null,
      sub_pool_id,
      sub_pool_name,
      share_class: share_class && {
        label: share_class.legal_name,
        value: share_class.id,
      },
      vehicle:
        vehicle &&
        carryVehicles?.find((carryVehicle) => carryVehicle.value == vehicle.id),
      vesting_schedule: {
        label: vesting_schedule.name,
        value: vesting_schedule.id,
      },
    };
    return initialValues

  },[selectedAllocation, carryVehicles])  
    

  const fetchAllocation = async () => {
   
    if (planId) {
      const response = await API.fetchCarryAllocationDetail(
        planId,
        selectedAllocation.allocation_id
      );
      if (response) {
        setAllocationDetail(response);
        setIsloading(false);
      }
    }
  };

  const handleFetchVestingSchedule = async () => {
    const res = await API.fetchVestingSchedule();
    if (res.success) {
      const schedules = res.data?.map((schedule: any) => ({
        label: schedule.name,
        value: schedule.id,
      }));
      setVestingSchedulesOptions(schedules);
    }
  };

  const fetchVehicles = async () => {
    const response = await API.fetchCarryVehicles();
    if (response.success) {
      setCarryVehicles(
        map(response.data, (vehicle: any) => ({
          ...vehicle,
          label: vehicle.legal_name,
          value: vehicle.id,
        }))
      );
    }
  };

  const handleFetchAllCarryParticipantsUngrouped = async () => {
    const res = await API.fetchAllCarryParticipantsUngrouped();
    if (res.success) {
      const participants = res.data?.map((deal: any) => ({
        label: deal.full_name,
        value: deal.id,
      }));
      setParticipantOptions(participants);
    }
  };

  const isValueEmpty=(value: any): boolean =>{
    if (value instanceof Date) {
      return isNaN(value.getTime()); 
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return false; // Consider 0 or false as filled
    }
    return isEmpty(value);
  }

  const validatePayload =(payload:any)=>{
    const requiredAttributes =['bps','grant_date','transfer_date','vesting_start_date','grant_date','vesting_schedule','carry_participant_id']
    const {transfer_to_allocations,transfer_from_allocation} = payload
    const hasEmptyRequiredField = transfer_to_allocations.some((obj:any) =>
      requiredAttributes.some(attr =>{
        if(isValueEmpty(obj[attr])){
          console.log(obj,attr)
          return true
        }
        else {return false}
      } )
    );

    const totalBpsToTransfer = getSumByProperty(transfer_to_allocations,'bps')
    const totalBpsExceeded = decimalGreaterThan(totalBpsToTransfer,transfer_from_allocation.bps)

    const hasAllocationWithZeroBps = transfer_to_allocations.some((obj:any) =>
      decimalEqual(obj.bps, "0")
    );
  
    if(isEmpty(transfer_to_allocations)){
      return 'Please create an allocation to transfer points'
    }

    if (hasEmptyRequiredField) {
      return 'Please fill all required fields';
    }

    if(hasAllocationWithZeroBps){
      return 'Can not create an allocation with 0 points'
    }

    if(totalBpsExceeded){
      return `Total points can not exceed ${truncateDecimal(transfer_from_allocation.bps,4)}`
    }


    return ''
  }

  const handleTransferPoints = async () => {
    
    const payload = {
      transfer_to_allocations: map(newAllocations,(newAllocation:any)=>{
        const {
          participant,
          bps,
          share_class,
          vehicle,
          vesting_schedule,
          sub_pool_id,
          sub_pool_name,
          transfer_date,
          grant_date,
          vesting_start_date,
        } = newAllocation;
        return {
          carry_participant_id: participant?.value || null,
          bps,
          sub_pool_id,
          sub_pool_name,
          grant_date: generateDateTimeWithZeroTime(grant_date),
          vesting_start_date: generateDateTimeWithZeroTime(vesting_start_date),
          issue_date: null,
          share_class: share_class?.value || 0,
          vehicle: vehicle?.value || 0,
          vesting_schedule: vesting_schedule?.value || null,
          transfer_points: bps,
          transfer_date: generateDateTimeWithZeroTime(transfer_date)
        }
      }),
      transfer_from_allocation: selectedAllocation,
    }

    const error = validatePayload(payload)

    console.log(payload,error);

    if(error){
      toast.error(error)
    }

else{
    const res = await API.carryPlanAllocationPointsTransfer(planId, payload);
    if (res.success) {
      refreshData(planId);
      toast.success("Points Transferred Successfully!!")
      handleCloseModal();
    }
    else{
      const firstError = res?.data?.[Object.keys(res.data)?.[0]]?.[0]
      toast.error(firstError)
    }}
  };

  const handleChange = (index: number,name: string, value: any) => {
    const newAllocationsArray = [...newAllocations];
    newAllocationsArray[index][name] = value;
    setNewAllocations(newAllocationsArray);
  };

  const handleAddField = () => {
    setNewAllocations([...newAllocations, { ...newAllocationTemplate }]);
  };

  const handleRemoveField = (index: number) => {
    const newAllocationsArray = newAllocations.filter((_, i) => i !== index);
    setNewAllocations(newAllocationsArray);
  };

  const shareClassOptions = (selectedVehicle: Record<string, any>) => {
    if (selectedVehicle) {
      return map(selectedVehicle?.classes, (shareClass: any) => ({
        ...shareClass.template_share_class,
        label: shareClass.template_share_class.legal_name,
        value: shareClass.template_share_class.id,
      }));
    } else return [];
  };



  useEffect(() => {
    if (selectedAllocation.allocation_id && carryVehicles) {
      fetchAllocation();
    }
  }, [selectedAllocation, carryVehicles]);

  useEffect(() => {
    handleFetchVestingSchedule();
    fetchVehicles();
    handleFetchAllCarryParticipantsUngrouped();
  }, []);

  return (
    <>
      <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
        <Modal.Header closeButton>
          <Modal.Title>Transfer Points</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ padding: "20px" }}>
            {!isLoading && allocationDetail ? (
              <>
                <Row>
                  <Col md={6} className="mb-2">
                    <AllocationDatesCard allocationDetail={allocationDetail} />
                  </Col>
                  <Col md={6} className="mb-2">
                    <AllocationPointsCard allocationDetail={allocationDetail} />
                  </Col>
                </Row>
                <Row className="mt-4">
                  <VestingSchedule allocationDetail={allocationDetail} />
                </Row>
              </>
            ) : (
              <NavableLoader />
            )}
            <hr />
            {map(newAllocations,(newAllocation:any,index:any)=>(
            <AllocationsCont>
              <StyledRow alignItems="end">
                <FieldWrapper>
                  <FormSelectorFieldRow
                    label="Participant"
                    name="participant"
                    placeholder="Select"
                    onChange={(val: any) => handleChange(index,"participant", val)}
                    value={newAllocation.participant}
                    options={participantOptions}
                  />
                </FieldWrapper>
                <FieldWrapper width={350}>
                  <FormSelectorFieldRow
                    label="Vesting Schedule"
                    name="vesting_schedule"
                    placeholder="Select"
                    onChange={(value: any) =>
                      handleChange(index,"vesting_schedule", value)
                    }
                    value={newAllocation.vesting_schedule}
                    options={vestingSchedulesOptions}
                  />
                </FieldWrapper>
                {get(carryVehicles,'length',0) > 0 && (
                  <>
                    <FieldWrapper>
                      <FormSelectorFieldRow
                        label="Vehicle"
                        name="vehicle"
                        placeholder="Vehicle"
                        onChange={(value: any) => {
                          handleChange(index,"vehicle", value);
                          handleChange(index,"share_class", null);
                          handleChange(index,"vesting_schedule", null);
                        }}
                        value={newAllocation.vehicle}
                        options={carryVehicles || []}
                      />
                    </FieldWrapper>
                    <FieldWrapper>
                      <FormSelectorFieldRow
                        label="Share Class"
                        name="share_class"
                        placeholder="Share Class"
                        onChange={(value: any) => {
                          handleChange(index,"share_class", value);
                          handleChange(
                            index,"vesting_schedule",
                            vestingSchedulesOptions?.find(
                              (opt: any) => opt.value == value.vesting_schedule
                            ) || null
                          );
                        }}
                        value={newAllocation.share_class}
                        options={shareClassOptions(newAllocation.vehicle)}
                      />
                    </FieldWrapper>
                  </>
                )}
                <FieldWrapper width={150}>
                  <FormDateField
                    onChange={(value: any) =>
                      handleChange(index,"vesting_start_date", value)
                    }
                    value={
                      newAllocation.vesting_start_date
                        ? new Date(newAllocation.vesting_start_date)
                        : null
                    }
                    placeholder="Vesting Start"
                    label="Vesting Start Date"
                  />
                </FieldWrapper>
                <FieldWrapper width={130}>
                  <FormDateField
                    onChange={(value: any) => handleChange(index,"grant_date", value)}
                    value={
                      newAllocation.grant_date
                        ? new Date(newAllocation.grant_date)
                        : null
                    }
                    placeholder="Grant Date"
                    label="Grant Date"
                  />
                </FieldWrapper>
                <FieldWrapper width={130}>
                  <FormDateField
                    onChange={(value: any) =>
                      handleChange(index,"transfer_date", value)
                    }
                    value={
                      newAllocation.transfer_date
                        ? new Date(newAllocation.transfer_date)
                        : null
                    }
                    placeholder="Transfer Date"
                    label="Transfer Date"
                  />
                </FieldWrapper>
                <FieldWrapper width={100}>
                  <FormTextFieldRow
                    label="Points"
                    placeholder="e.g. 100"
                    name="bps"
                    onChange={(e: any) => {
                      const val = e.target.value;
                      if (isValidPositiveUncappedDecimal(val) || val === "")
                        handleChange(index,"bps", val);
                    }}
                    value={newAllocation.bps}
                  />
                </FieldWrapper>
                <FieldWrapper>
                <DeleteIconWrapper>
                    <TrashIcon onClick={() => handleRemoveField(index)} />
                  </DeleteIconWrapper>
                </FieldWrapper>
              </StyledRow>
            </AllocationsCont>
            ))}
             <AddButton onClick={handleAddField}>+ Create Allocation To Transfer</AddButton>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <SecondaryButton
            onClick={handleTransferPoints}
          >
            Transfer
          </SecondaryButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PointsTransferModal;
