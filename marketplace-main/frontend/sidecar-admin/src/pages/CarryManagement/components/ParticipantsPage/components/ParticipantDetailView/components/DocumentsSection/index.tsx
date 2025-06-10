import { Label } from "../../../../styled";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { getDocumentsColumns } from "./constants";
import API from "../../../../../../../../api/backendApi";
import { useEffect, useState } from "react";
import NavableLoader from "../../../../../../../../components/NavableLoader";

const DocumentsSection = ({participantId}:any) => {

  const [isLoading,setIsLoading]=useState(true)
  const [hasEntity, setHasEntity] = useState<boolean>(false)
  const [carryDocuments, setCarryDocuments] = useState<any[]>([])

  const handleDocumentsFetch = async ()=> {
    setIsLoading(true)
    const res = await API.fetchParticipantCarryDocs(participantId)
    if(res.success) {
      setCarryDocuments(res.data)
      setHasEntity(res.data.some((item: any) => item.entity && item.entity.trim() !== 'Individual'))
    }
    setIsLoading(false)
}

    useEffect(() => {
      handleDocumentsFetch();
  }, []);

  if (isLoading) return <NavableLoader />;
  return (
    <div>
      <Label>Carry Documents</Label>
        <RsuiteTable
         height="400px"
         allowColMinWidth={true}
         rowSelection={false}
         columns={getDocumentsColumns(hasEntity)}
         data={carryDocuments}
         rowHeight={60}
         defaultSortBy=""
       />
    </div>
  )
};

export default DocumentsSection;
