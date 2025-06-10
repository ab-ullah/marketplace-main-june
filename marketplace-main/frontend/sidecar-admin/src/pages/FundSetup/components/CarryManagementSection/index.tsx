import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import {
  Title,
  FilterBox,
  InputBox,
  HeaderContainer,
  ButtonAndSearchContainer,
  TabsCont,
} from "./styles";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Breadcrumb, Tabs, Tab } from "react-bootstrap";
import NavableLoader from "../../../../components/NavableLoader";
import CreateCarryPool from "./components/CarryPoolModal";
import RsuiteTable from "../../../../components/Table/RSuite";
import {
  CARRY_ALLOCATE_TYPE,
  getAllocationsTableColumns,
  getPoolsTableColumns,
  TABS,
} from "./constants";
import { filter } from "lodash";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import API from "../../../../api/backendApi";
import {
  DEFAULT_ALLOCATION_ACTION_PAYLOAD,
  calculateAllocatedBps,
  calculateUnAllocatedBps,
  findObjectByPoolId,
  getObjectHierarchyByPoolId,
  getRefPoolId,
} from "./utils";
import AllocationsModal from "./components/AllocationsModal";
import CarryDiluteModal from "./components/CarryDiluteModal";

const CarryManagementSection = ({ fund }: any) => {
  const [filterQuery, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rowForAction, setRowForAction] = useState<{
    row: Record<string, any> | null;
    action: string;
  } | null>(null);
  const [poolTree, setPoolTree] = useState<any>({
    external_id: null,
    name: "#",
    deleted: false,
    bps: -1,
    pools: [],
    allocations: [],
  });
  const [vestingSchedules,setVestingSchedules]= useState<any[]>([])
  const [selectedPoolId, setSelectedPoolId] = useState<any>(null);
  const [tab, setTab] = useState<string | null>(TABS.POOLS);
  const { externalId } = useParams<{ externalId: string }>();
  const location = useLocation();

  const objectHierarchyByPoolId = useMemo(
    () => getObjectHierarchyByPoolId(poolTree, selectedPoolId),
    [poolTree, selectedPoolId]
  );

  const isRootLevel = objectHierarchyByPoolId.length<=1

  const selectedPoolObject = useMemo(
    () => findObjectByPoolId(poolTree, selectedPoolId) || poolTree,
    [poolTree, selectedPoolId]
  );

  const filtered = (data: any) => {
    if (filterQuery)
      return filter(data, (dat: any) =>
        dat.name.toLowerCase().includes(filterQuery.toLowerCase())
      );
    else return data;
  };

  const handleForteiture = async (row: any) => {
    const { base_pool_id, parent_pool_id } = getRefPoolId(objectHierarchyByPoolId);

    const payload = {
      ...DEFAULT_ALLOCATION_ACTION_PAYLOAD,
      base_pool_id,
      parent_pool_id,
      allocation_id: row.allocation_id,
      type: CARRY_ALLOCATE_TYPE.FORFEITE,
    };

    const res = await API.allocationAction(externalId,payload);

    if (res.success) {
      handleFetchCarryPools();
    } 
  };

  const handleRowAction=async(_rowForAction:any)=>{
    const {row, action}= _rowForAction

    switch (action.toLowerCase()) {
      case 'forfeit':
       await handleForteiture(row)
        break;
    
      default:
        break;
    }

    setRowForAction(null);
  }
  
  const handleFetchCarryPools = async () => {
    const res = await API.fetchCarryPools(externalId);
    if (res.success) {
      setPoolTree((prev: any) => ({ ...prev, pools: res.data }));
    }
  };

  const handleFetchVestingSchedule = async () => {
    const res = await API.fetchVestingSchedule();
    if (res.success) {
      setVestingSchedules(res.data)
    }
  };

  const handleFetch = async () =>{
    setIsLoading(true);
   await handleFetchCarryPools();
   await handleFetchVestingSchedule();
   setIsLoading(false);
  }

  const handleOpenPool = (poolId: any) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("poolId", poolId);
    window.history.pushState(null, '','?'+ searchParams.toString());
    setSelectedPoolId(poolId)
  };

  const handleRemoveParameter = (paramName: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete(paramName);
    window.history.pushState(null, '','?'+ searchParams.toString());
    setSelectedPoolId(null)
    setTab(TABS.POOLS)
  };

  const handleBreadCrumb = (poolId: any) => {
    poolId ? handleOpenPool(poolId) : handleRemoveParameter("poolId");
  };

  useEffect(() => {
    handleFetch()
  }, []);

  useEffect(() => {
    setRowForAction(null);
  }, [poolTree, selectedPoolId]);

  useEffect(() => {
    setFilter("");
  }, [selectedPoolId]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paramsPoolId = searchParams.get("poolId");
    setSelectedPoolId(paramsPoolId);
  }, [location.search]);

  return (
    <div>
      {isLoading ? (
        <NavableLoader />
      ) : (
        <div>
          <HeaderContainer>
            <Title>List of Carry Allocations</Title>
            <ButtonAndSearchContainer>
              <FilterBox>
                <InputBox
                  type="text"
                  placeholder="Filter"
                  value={filterQuery}
                  onChange={(e: any) => setFilter(e.target.value)}
                />
                <SearchOutlinedIcon />
              </FilterBox>
              <CreateCarryPool
                refetchData={handleFetchCarryPools}
                hierarchy={objectHierarchyByPoolId}
                unAllocatedBps={calculateUnAllocatedBps(selectedPoolObject)}
                disabled={!calculateUnAllocatedBps(selectedPoolObject)}
              />
              {!isRootLevel && (
                <AllocationsModal
                  refetchData={handleFetchCarryPools}
                  unAllocatedBps={calculateUnAllocatedBps(selectedPoolObject)}
                  poolAllocations={selectedPoolObject?.allocations}
                  hierarchy={objectHierarchyByPoolId}
                />
              )}
              <CarryDiluteModal
                refetchData={handleFetchCarryPools}
                hierarchy={objectHierarchyByPoolId}
                unAllocatedBps={calculateUnAllocatedBps(selectedPoolObject)}
                pool={selectedPoolObject}
              />
            </ButtonAndSearchContainer>
          </HeaderContainer>
          <Row>
            <Col md={12} className="my-4">
              This is the page of all carry allocations for {fund?.name}. To add
              a new carry allocation click the Create Carry Allocation button.
              To edit an existing carry allocation, click on the edit action
              next to carry allocation you wish to edit.
            </Col>
          </Row>
          {selectedPoolId && (
            <Row>
              <Breadcrumb>
                {objectHierarchyByPoolId.map((elem) => (
                  <Breadcrumb.Item
                    onClick={() => handleBreadCrumb(elem.poolId)}
                  >
                    {elem.name}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            </Row>
          )}

          {rowForAction?.row && (
            <ConfirmationModal
              title={`${rowForAction?.action} ${rowForAction?.row?.email ? 'Allocation': 'Pool'}`}
              data={rowForAction}
              handleConfirm={handleRowAction}
              handleCancel={() => setRowForAction(null)}
              description={`Are you sure you want to ${rowForAction.action} ${rowForAction.row?.name} ?`}
            />
          )}
          <Row
            style={{ border: "1px dotted", padding: "10px", margin: "10px" }}
          >
            {!isRootLevel &&
            <>
            <div>Total : {selectedPoolObject.bps} bps</div>
            <div>
              UnAllocated: {calculateUnAllocatedBps(selectedPoolObject)} bps
            </div>
            </>
}
            <div>
              Allocated: {calculateAllocatedBps(selectedPoolObject)} bps
            </div>
          </Row>
          <TabsCont fluid>
            <Tabs id="carry-pools" onSelect={setTab} activeKey={tab as string}>
              <Tab
                eventKey={TABS.POOLS}
                title="Pools"
                className="create-form-tab"
              >
                {tab === TABS.POOLS && (
                  <Row style={{ margin: "30px 0px" }}>
                    <Col md={12}>
                      <RsuiteTable
                        height="400px"
                        allowColMinWidth={true}
                        wordWrap={true}
                        rowSelection={false}
                        columns={getPoolsTableColumns(
                          setRowForAction,
                          handleFetchCarryPools,
                          handleOpenPool,
                          objectHierarchyByPoolId,
                          selectedPoolObject
                        )}
                        data={filtered(selectedPoolObject?.pools || [])}
                      />
                    </Col>
                  </Row>
                )}
              </Tab>
              {!isRootLevel && (
                <Tab
                  eventKey={TABS.ALLOCATIONS}
                  title="Allocations"
                  className="create-form-tab"
                >
                  {tab === TABS.ALLOCATIONS && (
                    <Row style={{ margin: "30px 0px" }}>
                      <Col md={12}>
                        <RsuiteTable
                          height="400px"
                          allowColMinWidth={true}
                          wordWrap={true}
                          rowSelection={false}
                          columns={getAllocationsTableColumns(setRowForAction,vestingSchedules,objectHierarchyByPoolId)}
                          data={selectedPoolObject?.allocations || []}
                        />
                      </Col>
                    </Row>
                  )}
                </Tab>
              )}
            </Tabs>
          </TabsCont>
        </div>
      )}
    </div>
  );
};

export default CarryManagementSection;
