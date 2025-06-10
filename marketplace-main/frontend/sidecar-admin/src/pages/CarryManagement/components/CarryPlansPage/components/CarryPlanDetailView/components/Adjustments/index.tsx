import {useEffect, useMemo, useState} from "react";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";
import AdjustmentModal from "./components/AdjustmentModal";
import API from "../../../../../../../../api/backendApi";
import size from "lodash/size";
import NavableLoader from "../../../../../../../../components/NavableLoader";
import ConfirmationModal from "../../../../../../../../components/ConfirmationModal";

interface IAdjustmentsProps {
    carryPlanId: string;
    allocations: any[];
    handleAllocationClick: (_allocation: any) => void; 
}

const Adjustments = ({ carryPlanId,handleAllocationClick }: IAdjustmentsProps) => {
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
    const [selectedAllocation, setSelectedAllocation] = useState<Record<string,any> | null>(null)
    const [adjustmentToDelete,setAdjustmentToDelete] = useState("")
    const [allocations, setAllocations] = useState<any[] | null>()
    const [isLoading,setIsLoading] = useState(true)

    const handleFetchCarryPlanAndAllocations = async (planId: string) => {
        setIsLoading(true)
        const res = await API.fetchCarryPlanAdjustmentAllocations(planId);
        if (res.success) {
            setAllocations(res.data.allocations);
        }
        setIsLoading(false)
    };

    const handleDeleteAdjustment =async (adjustmentId:any)=>{
        const res = await API.deleteAdjustmentById(adjustmentId)
        if(res.success){
            handleFetchCarryPlanAndAllocations(carryPlanId)
        }
        setAdjustmentToDelete("")
    }

    useEffect(() => {
        if (carryPlanId) handleFetchCarryPlanAndAllocations(carryPlanId);
    }, [carryPlanId]);

    const openModal = (allocation: any) => {
        setIsAdjustmentModalOpen(true)
        setSelectedAllocation(allocation)
    }

    const closeModal = ()=>{
        setIsAdjustmentModalOpen(false)
        setSelectedAllocation(null)
    }

    const allocationsWithAdjustments = useMemo(() => {
        return allocations?.map((allocation: any) => {
          const formattedAdjustments = allocation?.adjustments?.map((adjustment: any) => ({
              ...adjustment,
                isSubRow: true,
                rowKey: `${allocation.allocation_id}-${adjustment.id}`
          }))
          const payload =  {
            ...allocation,
            rowKey: allocation.allocation_id,
        }
        if (size(formattedAdjustments) > 0){
            payload.children = formattedAdjustments;
        }
        return payload;
        }
    )
    }, [allocations])

    if(isLoading) return <NavableLoader/>
    return <>
        <RsuiteTable
            height=""
            autoHeight={true}
            allowColMinWidth={true}
            rowSelection={false}
            defaultSortBy="issue_date"
            defaultSortType="desc"
            columns={getColumns(openModal,handleAllocationClick,setAdjustmentToDelete)}
            data={allocationsWithAdjustments}
            wordWrap={true}
            isTree={true}
            rowKey="rowKey"
        />
        {selectedAllocation && <AdjustmentModal
            selectedAllocation={selectedAllocation}
            carryPlanId={carryPlanId}
            isOpen={isAdjustmentModalOpen}
            initValues={null}
            onClose={closeModal}
            afterSubmit={()=>handleFetchCarryPlanAndAllocations(carryPlanId)}
        />}

        {adjustmentToDelete &&
            <ConfirmationModal
                title="Confirm Deletion"
                description="Are you sure you want to delete this adjustment?"
                data={adjustmentToDelete}
                handleConfirm={handleDeleteAdjustment}
                handleCancel={()=>setAdjustmentToDelete("")}
            />}

    </>


}

export default Adjustments;