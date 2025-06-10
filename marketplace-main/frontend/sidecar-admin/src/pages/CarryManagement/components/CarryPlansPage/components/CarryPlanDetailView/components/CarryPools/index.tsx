import { useState } from "react";
import SubpoolCard from "./PoolCard";
import { PoolContainer, PoolHeader } from "./styles";
import EditPoolModal from "./EditPoolModal";
import { useGetCarryPoolsQuery } from "../../../../../../../../api/rtkQuery/carryApi";
import TransferUnallocatedPointsModal from "./TransferUnallocatedPointsModal";
import { Button } from "react-bootstrap";
import { PLAN_ID_PARAM } from "../../../../../../constants";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import DeletePoolConfirmationModal from "./DeletePoolConfirmationModal";
import AddNewPoolModal from "./AddNewPoolModal";
import NavableLoader from "../../../../../../../../components/NavableLoader";

const CarryPools = ({refetchCarryDetail}:{refetchCarryDetail?:any}) => {
    const searchParams = new URLSearchParams(window.location.search);
    const planId = searchParams.get(PLAN_ID_PARAM);
    const [selectedPool, setSelectedPool] = useState<any>(null);
    const [isPoolDeletionModalOpen, setIsPoolDeletionModalOpen] = useState(false);
    const [isEditPoolModalOpen, setIsEditPoolModalOpen] = useState(false);
    const [isTransferPointsModalOpen, setIsTransferPointsModalOpen] = useState(false);
    const [isAddPoolModalOpen, setIsAddPoolModalOpen] = useState(false);

    const { data: carryPools, refetch, isLoading, isFetching, isUninitialized } = useGetCarryPoolsQuery(planId ? Number(planId) : skipToken);

    const handleRefetch=()=>{
        refetch()
       if(refetchCarryDetail) refetchCarryDetail()
    }

    if(isLoading || isFetching || isUninitialized) return <NavableLoader />

    if (!carryPools?.length) return <p>There are no sub pools</p>;

    const totalExistingPoints = carryPools.reduce((sum: number, pool: any) => sum + (pool.bps || 0), 0);

    return <>
        <PoolHeader>
            <h4>{carryPools.length} Pools</h4>
            <div>
                <Button variant="outline-primary" onClick={() => setIsTransferPointsModalOpen(true)}>Transfer Unallocated Points</Button>
                {
                    totalExistingPoints < 100 && <Button onClick={() => setIsAddPoolModalOpen(true)}>+ Add New Pool</Button>
                }
            </div>
        </PoolHeader>
        <PoolContainer>
            {carryPools.map((pool: any) => 
            <SubpoolCard 
                subpool={pool} 
                onRenameCarryPool={() => {
                setSelectedPool(pool);
                setIsEditPoolModalOpen(true);
                }}
                onDeletePool={() => {
                    setSelectedPool(pool);
                    setIsPoolDeletionModalOpen(true);
                }}
                onTransferPoints={() => {
                    setSelectedPool(pool);
                    setIsTransferPointsModalOpen(true);
                }}
            />)}
            {selectedPool && <EditPoolModal isOpen={isEditPoolModalOpen} pool={selectedPool} onClose={(shouldRefetch?:boolean) => {
                setIsEditPoolModalOpen(false);
                setSelectedPool(null);
                if(Boolean(shouldRefetch))  handleRefetch();
            }} />}
            {selectedPool && <DeletePoolConfirmationModal isOpen={isPoolDeletionModalOpen} poolId={selectedPool.id} poolName={selectedPool.name} onClose={(shouldRefetch?:boolean) => {
                setIsPoolDeletionModalOpen(false);
                setSelectedPool(null);
                if(Boolean(shouldRefetch))  handleRefetch();
            }} />}
            <TransferUnallocatedPointsModal isOpen={isTransferPointsModalOpen} pool={selectedPool} availablePools={carryPools} onClose={(shouldRefetch?:boolean) => {
                setIsTransferPointsModalOpen(false);
                setSelectedPool(null);
                if(Boolean(shouldRefetch))  handleRefetch();
            }} />
            <AddNewPoolModal isOpen={isAddPoolModalOpen} totalExistingPoints={totalExistingPoints}  onClose={(shouldRefetch?:boolean) => {
                setIsAddPoolModalOpen(false)
                if(Boolean(shouldRefetch))  handleRefetch();
            }} />
        </PoolContainer>
    </>
}

export default CarryPools