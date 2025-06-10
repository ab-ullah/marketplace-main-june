import { useEffect, useMemo, useRef, useState } from "react";
import InfoTable from "./components/InfoTable";
import API from "../../../../../../../../../../api/backendApi";
import RsuiteTable from "../../../../../../../../../../components/Table/RSuite";
import {
  formatInfoTableData,
  formatNewAllocationsData,
  generateAllocationsFooterData,
  getColumns,
  getSelectorKey,
} from "./constants";
import { FormTextFieldRow } from "../../../../../../../../../../components/Form/TextField";
import { FormSelectorFieldRow } from "../../../../../../../../../../components/Form/SelectorField";
import filter from "lodash/filter";
import {
  CountText,
  HelperTextCont,
  SectionBorder,
  SpaceBetween,
  StyledRow,
  AssignButton,
  FieldWrapper,
  DeleteButton,
} from "./styles";
import ToggleSwitch from "../../../../../../../../../../components/ToggleSwitch";
import { generateCarryAllocationsPayload, MODAL_MODE } from "../../../../constants";
import NavableLoader from "../../../../../../../../../../components/NavableLoader";
import {
  getSumByProperty,
  isValidPositiveDecimal,
  isValidPositiveUncappedDecimal,
  limitCarryDecimalPlaces
} from "../../../../../../../../../../utils/getValue";
import SubpoolSection from "./components/SubpoolSection";
import map from "lodash/map";
import { toast } from "react-toastify";
import isEmpty from "lodash/isEmpty";
import { createDecimal, decimalSubtract, decimalSum, decimalMultiply, decimalLessOrEqual, decimalEqual } from "../../../../../../../../../../utils/decimal";
import ConfirmationModal from "../../../../../../../../../../components/ConfirmationModal";
import FormDateField from "../../../../../../../../../../components/Form/DateField";

const CarryAllocationsStep = ({
  firstStepData,
  handleChange,
  mode,
  isCarrySubpoolsActive,
  handleCloseModal,
  refreshData,
}: {
  firstStepData: any;
  handleChange: any;
  mode:string;
  isCarrySubpoolsActive: boolean;
  handleCloseModal: (id: any) => void;
  refreshData: any;
}) => {
  const [vestingSchedulesOptions, setVestingSchedulesOptions] = useState<any[]>(
    []
  );
  const [carryVehicles, setCarryVehicles] = useState<any[]>([])
  const [editState, setEditState] = useState<{
    search: string;
    bps: string | number;
    vesting_schedule: any;
    vesting_start_date: string;
    vehicle: any;
    share_class: any;
    subpool: any;
    grant_date: string;
  }>({
    search: "",
    vesting_schedule: undefined,
    bps: "",
    vesting_start_date:"",
    vehicle: undefined,
    share_class: undefined,
    subpool: null,
    grant_date: ''
  });
  const selectedRows = useRef<any[]>([]);
  const [selectResetTrigger, setSelectResetTrigger] = useState(false);
  const [selectedParticipantsCount, setSelectedParticipantsCount] = useState(0);
  const [showWithBps, setShowWithBps] = useState(false);
  const [remainingCompanyUsers, setRemainingCompanyUsers] = useState<any[]>([]);
  const [isVestingOptionsLoading, setIsVestingOptionsLoading] = useState(false)
  const [originalAllocations, setOriginalAllocations] = useState([]) // For Issue Allocations only
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { default_vesting_schedule, allocations, bps, carryPlanId, sub_pools } = firstStepData;

  const dataKey= getSelectorKey(mode)

  const allParticipantsList = useMemo(
    () => mode===MODAL_MODE.EDIT_ALLOCATIONS ? [...(allocations || [])] : formatNewAllocationsData([...(allocations || []), ...remainingCompanyUsers],default_vesting_schedule),
    [allocations, remainingCompanyUsers, mode, default_vesting_schedule ]
  );

  const carryAllocationsFooterData = useMemo(() => {
    return generateAllocationsFooterData(allParticipantsList || [],mode);
  }, [allParticipantsList,mode]);

  const assignButtonLabel = mode === MODAL_MODE.EDIT_ALLOCATIONS ? 'Update' : 'Assign Points'

  const handleToggleChange = () => {
    setShowWithBps((prev) => !prev);
  };

  const handleEditState = (key: string, value: any) => {
    setEditState((prev: any) => ({ ...prev, [key]: value }));
  };

  const searchFilter = (data: any) => {
    if (editState.search)
      return filter(data, (dat: any) =>
        dat.name.toLowerCase().includes(editState.search.toLowerCase())
      );
    else return data;
  };

  const pointsFilter = (data: any) => {
    if (showWithBps) return filter(data, (dat: any) => dat.bps || dat.existing_bps);
    else return data;
  };

  const shareClassOptions = (selectedVehicle: Record<string, any>) => {
    if (selectedVehicle) {
      return map(selectedVehicle?.classes,(shareClass: any) => ({
        ...shareClass.template_share_class,
        label: shareClass.template_share_class.legal_name,
        value: shareClass.template_share_class.id,
      }));
    } else return [];
  };

  const handleResetEditState = ()=>{
    setEditState((prev) => ({
      ...prev,
      vesting_schedule: (mode !== MODAL_MODE.EDIT_ALLOCATIONS) ? prev.vesting_schedule : null,
      vesting_start_date:"",
      bps:"",
      grant_date:"",
      subpool:  (isCarrySubpoolsActive &&  (mode !== MODAL_MODE.EDIT_ALLOCATIONS))? prev.subpool : null
    }));
  }

  const handleResetSelected=()=>{
    setSelectResetTrigger(prev=>!prev)
  }

  const handleAssign = () => {
    const { vesting_schedule, bps = "0", vesting_start_date, vehicle, share_class, subpool, grant_date } = editState;
    let isValidBps= true
    let errMessage = ""
    const selectedParticipants = filter(allParticipantsList,participant=>selectedRows?.current?.includes(participant[dataKey]))
    if(isCarrySubpoolsActive && !isEmpty(sub_pools)){

      if(subpool?.id){

      if(bps===""){
        const participantsOtherSubpools = filter(selectedParticipants, participant=>participant.sub_pool_id != subpool.id)
        const pointsAllocatedOtherSubpools =  getSumByProperty( participantsOtherSubpools,"bps")

        if(decimalLessOrEqual(pointsAllocatedOtherSubpools, subpool.un_allocated))  isValidBps=true
        else  {
          isValidBps=false
          errMessage="Not enough unallocated points in the selected pool"
        }

      }
      else  {

      const totalBpsToAllocate = decimalMultiply(bps, selectedParticipantsCount);
      const participantsOfSelectedSubpool = filter(selectedParticipants, participant=>participant.sub_pool_id == subpool.id)
      const alreadyAllocatedPoints = getSumByProperty( participantsOfSelectedSubpool,"bps")
      const totalBpsDecimal = decimalSubtract(totalBpsToAllocate, alreadyAllocatedPoints);

      if (decimalLessOrEqual(totalBpsDecimal, subpool.un_allocated)) {
        isValidBps=true
      }
      else {
        isValidBps= false
        errMessage=`Can not assign points more than ${createDecimal(subpool.un_allocated).toString()}`
      }
    }
  }
  else if( mode === MODAL_MODE.EDIT_ALLOCATIONS){
if(bps!==""){
  
 const canAssignBps = sub_pools.every((sub_pool:any)=>{
    const participantsOfSelectedSubpool = filter(selectedParticipants, participant=>participant.sub_pool_id == sub_pool.id)
          const totalBpsToAllocate = decimalMultiply(bps, participantsOfSelectedSubpool.length);
    const alreadyAllocatedPoints = getSumByProperty( participantsOfSelectedSubpool,"bps")
    const totalBpsDecimal = decimalSubtract(totalBpsToAllocate, alreadyAllocatedPoints);

    return decimalLessOrEqual(totalBpsDecimal, sub_pool.un_allocated)
  })

  if(canAssignBps){
    isValidBps=true
  }
  else {
    isValidBps= false
     errMessage="Not enough unallocated points in some subpool(s)"
  }
}
  }
    }
    else{
      if(bps!==""){
        const carryAllocatedPoints = getSumByProperty(allParticipantsList,"bps")
        const carryUnallocatedPoints = decimalSubtract(firstStepData.bps, carryAllocatedPoints);
        const totalBpsToAllocate = decimalMultiply(bps, selectedParticipantsCount);
  
if(mode === MODAL_MODE.EDIT_ALLOCATIONS){
  
  const alreadyAllocatedPointsToSelected = getSumByProperty(selectedParticipants, "bps");
  const selectedBpsDiff = decimalSubtract(totalBpsToAllocate, alreadyAllocatedPointsToSelected);
  
  if (decimalLessOrEqual(selectedBpsDiff,carryUnallocatedPoints)) {
    isValidBps=true
  }
  else{
    isValidBps= false
          errMessage=`Cannot assign points more than ${carryUnallocatedPoints.toString()}`;
  }
}
else {

const carryExistingBps = getSumByProperty(allParticipantsList,"existing_bps")
const totalBpsSum = decimalSum(carryAllocatedPoints, totalBpsToAllocate, carryExistingBps);
  
if (decimalLessOrEqual(totalBpsSum ,firstStepData.bps)) {
  isValidBps=true
}
else {
  isValidBps= false
  errMessage=`Can not assign points more than ${carryUnallocatedPoints.toString()}`;
}
}
      }
    }

    if(isValidBps){
    const updatedParticipants = allParticipantsList
      .map((allocation: any) => {
        const bpsToAssign = bps ? createDecimal(bps).toString() : createDecimal(allocation.bps).toString();
  
        return {
          ...allocation,
          ...(selectedRows?.current?.includes(allocation[dataKey])
            ? {
                vesting_schedule: vesting_schedule
                  ? {
                      id: vesting_schedule?.value,
                      name: vesting_schedule?.label,
                    }
                  : (mode !== MODAL_MODE.EDIT_ALLOCATIONS) ? default_vesting_schedule : allocation.vesting_schedule,
                vesting_start_date: vesting_start_date || allocation.vesting_start_date,
                bps: bpsToAssign,
                vehicle: vehicle ? {
                  id: vehicle?.value,
                  legal_name: vehicle?.legal_name,
                } : (allocation.vehicle || {}),
                share_class: share_class ? {
                  id: share_class?.value,
                  legal_name: share_class?.legal_name || share_class?.label,
                } : allocation.share_class || {},
                ...((subpool && bpsToAssign)? {sub_pool_id: bpsToAssign && subpool.id, sub_pool_name : bpsToAssign && subpool.name}:{}),
                grant_date: grant_date || allocation.grant_date,
              }
            : {}),
        };
      })
      // .filter((allocation: any) => allocation.bps);
      let updatedRemainingCompanyUsers:any[]=[]
      let updatedAllocations: any[]=[]
      updatedParticipants.forEach((participant:any)=>{
        if(participant.bps || participant.existing_bps){
          updatedAllocations.push(participant)
        }
        else{
          updatedRemainingCompanyUsers.push(participant)
        }
      })
    handleChange("allocations", updatedAllocations);
    setRemainingCompanyUsers(updatedRemainingCompanyUsers)
   if(isCarrySubpoolsActive) handleRecalculateSubpools(updatedAllocations)
    }

    else{
      toast.error(errMessage)
    }
    handleResetEditState();
    handleResetSelected();
  };

  const handleRecalculateSubpools=(updatedAllocations:any[])=>{
   const updatedSubpools =  map(sub_pools, (subpool) => {
      const subpoolAllocations = filter(
        [...updatedAllocations,...(mode !== MODAL_MODE.EDIT_ALLOCATIONS ? originalAllocations : [])],
        (allocation) => allocation.sub_pool_id == subpool.id
      );
      const allocated = getSumByProperty(subpoolAllocations, "bps") 
      return {
        ...subpool,
        allocated,
        un_allocated: decimalSubtract(subpool.bps,allocated).toString()
      };
    });
    handleChange("sub_pools",updatedSubpools)
  }

  const handleSelectRow = (_rows: any[]) => {
    const rows = _rows.filter((row) => row);
    selectedRows.current = rows;
    setSelectedParticipantsCount(rows.length);
  };

  const handleFetchVestingSchedule = async () => {
    setIsVestingOptionsLoading(true)
    const res = await API.fetchVestingSchedule();
    if (res.success) {
      const schedules = res.data?.map((schedule: any) => ({
        label: schedule.name,
        value: schedule.id,
      }));
      setVestingSchedulesOptions(schedules);
    }
    setIsVestingOptionsLoading(false)
  };

  const fetchVehicles = async () => {
    const response = await API.fetchCarryVehicles()
    if(response.success) {
      setCarryVehicles(map(response.data,(vehicle: any) => ({
        ...vehicle,
        label: vehicle.legal_name,
        value: vehicle.id
      })))
    }
  }

  const handleFetchRemainingCompanyUsers = async () => {
    const res = await API.fetchCarryPlanCompanyUsers(carryPlanId);
    if (res.success) {
      setRemainingCompanyUsers(res.data);
    }
  };

    const handleDelete = async () => {
      const selectedParticipants = filter(allParticipantsList,participant=>selectedRows?.current?.includes(participant[dataKey]))

      let planId =firstStepData.carryPlanId || ''
      const payload = generateCarryAllocationsPayload({allocations: selectedParticipants},'delete');
      const res = await API.createCarryPlanAllocations(
        planId,
        payload
      );
      if(res.success){
        toast.success("Deleted Successfully");        
      }
      else {
        toast.error("Request failed");
      }
      setShowConfirmation(false)
      handleCloseModal(firstStepData.carry_plan_id)
      refreshData(planId,false)
    }

  useEffect(() => {
    if (carryPlanId) {
      const hasParticipantsWithPoints = !!(allocations || []).filter(
        (allocation: any) => allocation.bps
      ).length;
      if(mode===MODAL_MODE.EDIT_ALLOCATIONS){
        setShowWithBps(true)
      }
      else{
      setShowWithBps(hasParticipantsWithPoints);
    }
      handleFetchVestingSchedule();
      fetchVehicles();
      if(mode===MODAL_MODE.ADD_ALLOCATIONS || mode === MODAL_MODE.CREATE_CARRY_PLAN) handleFetchRemainingCompanyUsers();
    }
  }, [carryPlanId]);

  useEffect(() => {

    const getRetainedSubpool =(subpoolId:any)=>{
const retainedSubpool= sub_pools.find((pool:any)=>pool.id===subpoolId)
return retainedSubpool || sub_pools?.[0] || null
    }

    setEditState((prev) => ({
      ...prev,
      vesting_schedule: (mode !== MODAL_MODE.EDIT_ALLOCATIONS) ? default_vesting_schedule : null,
      subpool: (isCarrySubpoolsActive &&  (mode !== MODAL_MODE.EDIT_ALLOCATIONS))? (getRetainedSubpool(prev?.subpool?.id)):null,

    }));
  }, [default_vesting_schedule, sub_pools]);

  useEffect(()=>{
    if(isCarrySubpoolsActive && editState.subpool?.id){
    const selectedSubpool = editState.subpool
    if(selectedSubpool && carryVehicles?.length){
      const {vehicle, template_share_class_name, template_share_class, vesting_schedule }= selectedSubpool
    setEditState((prev) => ({
      ...prev,
      vehicle:vehicle ? carryVehicles.find(carryVehicle=>carryVehicle.value ==vehicle.value):null,
      share_class: template_share_class? {label: template_share_class_name, value: template_share_class}: null,
      vesting_schedule: vesting_schedule?.value ? vesting_schedule : (mode !== MODAL_MODE.EDIT_ALLOCATIONS) ? default_vesting_schedule : null
    }));}}
  },[editState?.subpool, carryVehicles, isCarrySubpoolsActive])

  useEffect(()=>{
   if(allocations?.length > 0 && !allocations?.[0].isFormatted && mode !== MODAL_MODE.EDIT_ALLOCATIONS) setOriginalAllocations(allocations || [])
  },[allocations])


  if (Object.keys(firstStepData).length === 0)
    return <div style={{ padding: "20px" }}>Loading....</div>;

  return (
    <div style={{ padding: "20px" }}>
      <InfoTable info={formatInfoTableData(firstStepData)} />
    {isCarrySubpoolsActive &&  <SubpoolSection subpools={sub_pools} selectedSubpool={editState.subpool} handleSelectSubpool ={(selected:any)=> handleEditState("subpool", selected)}/>}
      {!isVestingOptionsLoading?
      <SectionBorder>
        <SpaceBetween>
          <div>
            <CountText>
              {selectedParticipantsCount} selected participants
            </CountText>
            <HelperTextCont>
              Edit point allocations and vesting schedules for selected
              participants
            </HelperTextCont>
          </div>
          {mode!==MODAL_MODE.EDIT_ALLOCATIONS &&
          <ToggleSwitch
            checked={showWithBps}
            onChange={handleToggleChange}
            title="Only show participants with points"
          />
}
        </SpaceBetween>
        <div className="mt-2">
          <StyledRow alignItems="end">
              <FormTextFieldRow
                label=""
                placeholder="Search participants"
                name="search"
                onChange={(e: any) => handleEditState("search", e.target.value)}
                value={editState.search}
              />
              <FieldWrapper width={350}>
              <FormSelectorFieldRow
                label=""
                name="vesting_schedule"
                placeholder="Select"
                onChange={(value: any) =>
                  handleEditState("vesting_schedule", value)
                }
                value={editState.vesting_schedule}
                options={vestingSchedulesOptions}
              />
              </FieldWrapper>
              {carryVehicles?.length>0 && <>
              <FieldWrapper>
              <FormSelectorFieldRow
                label=""
                name="vehicle"
                placeholder="Vehicle"
                onChange={(value: any) =>{
                  handleEditState("vehicle", value);
                  handleEditState("share_class",null);
                  handleEditState("vesting_schedule",(mode !== MODAL_MODE.EDIT_ALLOCATIONS) ? default_vesting_schedule : null);
                }
                }
                value={editState.vehicle}
                options={carryVehicles}
              />
              </FieldWrapper>
              <FieldWrapper>
              <FormSelectorFieldRow
                label=""
                name="share_class"
                placeholder="Share Class"
                onChange={(value: any) => {
                    handleEditState("share_class", value)
                    handleEditState("vesting_schedule", vestingSchedulesOptions?.find(
                      (opt: any) => opt.value == value.vesting_schedule
                    ) || (mode !== MODAL_MODE.EDIT_ALLOCATIONS) ? default_vesting_schedule : null)
                  }
                }
                value={editState.share_class}
                options={shareClassOptions(editState.vehicle)}
              />
              </FieldWrapper>
              </>}
              <FieldWrapper width={130}>
              <FormDateField
                onChange={(value: any) =>
                  handleEditState("vesting_start_date", value)
                }
                value={ editState.vesting_start_date
                  ? new Date(editState.vesting_start_date)
                  : null
                }
                placeholder="Vesting Start"
                label="Vesting Start Date"
              />
              </FieldWrapper>
              <FieldWrapper width={130}>
              <FormDateField
                onChange={(value: any) =>
                  handleEditState("grant_date", value)
                }
                value={editState.grant_date
                  ? new Date(editState.grant_date)
                  : null
                }
                placeholder="Grant Date"
                label="Grant Date"
              />
              </FieldWrapper>
              <FieldWrapper width={100}>
              <FormTextFieldRow
                label=""
                placeholder="e.g. 100"
                name="bps"
                onChange={(e: any) => {
                  const val= e.target.value
                 if(isValidPositiveUncappedDecimal(val) || val==="") handleEditState("bps",  val)}}
                value={editState.bps}
              />
              </FieldWrapper>
              <div className="mt-2">
                <AssignButton
                  onClick={() => handleAssign()}
                  disabled={!selectedParticipantsCount
                    || (mode===MODAL_MODE.EDIT_ALLOCATIONS?  editState.bps==='' ? false : decimalEqual(editState.bps,'0') :  ( editState.bps==='' || decimalEqual(editState.bps,'0')|| editState.grant_date === '' || editState.vesting_start_date === ''))
                   
                }
                >
                  {assignButtonLabel}
                </AssignButton>
              </div>
              { (mode === MODAL_MODE.EDIT_ALLOCATIONS) && <DeleteButton  onClick={()=>setShowConfirmation(true)} disabled={selectedRows.current.length === 0}>Delete</DeleteButton>} 
          </StyledRow>

          <div className="mt-3">
            <RsuiteTable
              height="400px"
              allowColMinWidth={true}
              rowSelection={true}
              dataKey={dataKey}
              handleSelectRow={(rows) => handleSelectRow(rows)}
              selectResetTrigger={selectResetTrigger}
              columns={getColumns(Number(bps),mode, isCarrySubpoolsActive && sub_pools?.length>0)}
              data={[
                ...searchFilter(pointsFilter(allParticipantsList)),
                carryAllocationsFooterData,
              ]}
              rowHeight={72}
              wordWrap={true}
            />
          </div>
        </div>
      </SectionBorder>
      :
      <NavableLoader/>
}
      {showConfirmation && (
        <ConfirmationModal
          title='Delete Participants'
          description='Are you sure you want to delete the selected participants?'
          handleConfirm={handleDelete}
          handleCancel={()=>setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default CarryAllocationsStep;