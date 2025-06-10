import { useEffect, useState } from "react";
import API from "../../../../../../api/backendApi";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";
import InfoTileLayout from "../../../InfoTileLayout";
import { isEmpty, get } from "lodash";
import FilePreviewModal from "../../../../../../components/FilePreviewModal";
import { toast } from "react-toastify";

const CarryParticipantDocs = ({participantsDocsList, refetch}:{participantsDocsList:any[],refetch:any}) => {
 
  const [fileToPreview,setFileToPreview]=useState<any>(null)

  const data = [
    {
      label: "Documents",
      value: participantsDocsList?.length,
    },
    {
      label: "Unreleased",
      value: participantsDocsList?.filter((elem: any) => !elem.is_released).length,
    },
    {
      label: "Pending Signature",
      value: participantsDocsList?.filter(
        (elem: any) => elem.is_signature_required && !elem.completed
      ).length,
    },
    {
      label: "Pending Acknowledgment",
      value: participantsDocsList?.filter((elem: any) => !elem.is_signature_required && !elem.is_acknowledged).length,
    },
    {
      label: "Pending GP Signature",
      value: participantsDocsList?.filter(
        (elem: any) =>
          elem.is_signature_required &&
          elem.is_gp_signature_required &&
          !elem.gp_signing_complete
      ).length,
    },
  ];

  const handleFileToPreview=(doc:any)=>{
    setFileToPreview(doc)
  }

  const handleGpSign=async(row:any)=>{
    const {gp_signing_complete,envelope_id}=row

    if (gp_signing_complete || !envelope_id) return; 
        const {host, protocol} = window.location;
        const return_url = encodeURIComponent(
          `${protocol}//${host}/admin/carryManagement/documents/signature/${envelope_id}`
      );
        const response = await API.getCarrySigningURL(envelope_id, return_url);
        if(response.success) window.open(response.data.signing_url, "_self");
        return response;
  }

  const handleReleaseDocument = async(row:any)=>{
    if(!row.is_released){
    const res = await API.releaseCarryParticipantsDocument(row.id,{is_released:true})
    if(res.success){
      toast.success(`${row?.document?.title} has been released!!`)
      refetch()
    }}

  }

  const handleDeleteDocument = async(row:any)=>{
    const res = await API.deleteCarryParticipantsDocument(row.id)
    if(res.success){
      toast.success(`${row?.document?.title} has been deleted!!`)
      refetch()
    }
  }


  return (
    <div>
      <InfoTileLayout data={data} colProps={{lg: 3}}/>
      <div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(handleFileToPreview,handleGpSign, handleReleaseDocument, handleDeleteDocument)}
          data={participantsDocsList}
          wordWrap={true}
        />
      </div>
      {!isEmpty(fileToPreview) &&
      <FilePreviewModal
        documentId={get(fileToPreview, "document_id")}
        documentName={get(fileToPreview, "title")}
        callbackCloseFile={()=>setFileToPreview(null)}
        onlyPreview
      />}
    </div>
  );
};

export default CarryParticipantDocs;
