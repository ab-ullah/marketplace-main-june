import { useEffect, useState } from "react";
import StatsTable from "../../../StatsTable";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";
import filter from "lodash/filter";
import API from "../../../../../../api/backendApi";
import { getSumByProperty } from "../../../../../../utils/getValue";
import CustomPagination from "../../../../../../components/CustomPagination";
import NavableLoader from "../../../../../../components/NavableLoader";
import { useGetExportForStats } from "../../../../../../components/ExportButton";
import AddParticipant from "../AddParticipant";
import CarryPlansExport from "../../../CarryPlansPage/components/CarryPlansListView/components/CarryPlansExport";
import AllocationsExport from "./components";

const ParticipantsListView = ({
  selectParticipantToView,
}: {
  selectParticipantToView: any;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true)
  const exportButton = useGetExportForStats()

  const searchFilter = (data: any) => {
    if (searchQuery)
      return filter(data, (dat: any) =>
        dat.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    else return data;
  };

  const handleFetchAllParticipants = async (showLoader=true) => {
   if(showLoader) setIsLoading(true)
    const res = await API.fetchAllCarryParticipants();
    if (res.success) {
      setList(res.data);
    }
    setIsLoading(false)
  };

  useEffect(() => {
    handleFetchAllParticipants();
  }, []);

  const InfoTileData = [
    { label: "Participants", value: list.length},
  ];
  // const itemsPerPage = 40;
  // const totalPages = Math.ceil(list.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  if(isLoading) return <NavableLoader/>

  return (
    <>
    <div className="d-flex justify-content-end">
    <AddParticipant handleRefetchParticipants={()=>handleFetchAllParticipants(false)}/>
    </div>
      <StatsTable
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search within the participants"
        InfoTileData={InfoTileData}
        additionalButtons={[<AllocationsExport />]}
      />

      <div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(selectParticipantToView)}
          data={searchFilter(list)}
        />
        <div style={{display:'flex', justifyContent:'flex-end', marginTop:'20px'}}>
         </div> 
      </div>
    </>
  );
};

export default ParticipantsListView;
