import { Label } from "../../../../styled";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import API from "../../../../../../../../api/backendApi";
import { useEffect, useState } from "react";
import NavableLoader from "../../../../../../../../components/NavableLoader";
import { PARTICIPANT_ID_PARAM } from "../../../../../../constants";
import { getColumns } from "./constants";

const CommitmentsSection = () => {
  const [commitsList, setCommitsList] = useState<any[]>([]);
  const [isLoading,setIsLoading]=useState(true)
  const fetchCommitments = async (id: any) => {
    setIsLoading(true)
    const res = await API.fetchParticipantCommitments(id);
    if (res.success) {
      setCommitsList(res.data);
    }
    setIsLoading(false)
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramsId = searchParams.get(PARTICIPANT_ID_PARAM);

    fetchCommitments(paramsId);
  }, []);

  if (isLoading) return <NavableLoader />;

  return (
    <div>
      <Label>Commitments</Label>
      <RsuiteTable
        height="400px"
        allowColMinWidth={true}
        rowSelection={false}
        columns={getColumns()}
        data={commitsList}
        rowHeight={60}
        defaultSortBy=""
      />
    </div>
  );
};

export default CommitmentsSection;
