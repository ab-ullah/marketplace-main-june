import { useEffect, useState } from "react";
import { TopRow, SubTitle, PillButton } from "../../../styles";
import CreateDocumentModal from "./components/CreateDocumentModal";
import API from "../../../../../../api/backendApi";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";
import FilePreviewModal from "../../../../../../components/FilePreviewModal";
import get from "lodash/get";
import { isEmpty } from "lodash";
import { useGetMeAdminUserQuery } from "../../../../../../api/rtkQuery/commonApi";

const CarryTemplateDocs = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [state, setState] = useState<any[]>([]);
  const [docToEdit, setDocToEdit] = useState<any>({});
  const [fileToPreview,setFileToPreview]=useState<any>(null)

  const {data: userInfo} = useGetMeAdminUserQuery()
  const isSidecarAdmin = userInfo?.user?.is_sidecar_admin

  const handleCloseModal = (refresh?: boolean) => {
    setShowModal(false);
    setDocToEdit({})
    if (refresh) {
      handleFetchCarryTemplateDocuments();
    }
  };

  const handleFetchCarryTemplateDocuments = async () => {
    const res = await API.fetchCarryTemplateDocuments();
    if (res.success) {
      setState(res.data);
    }
  };

  const handleToggleActivateDoc = async (row: any) => {
    const { id, document_status } = row;

    const res = await API.editCarryDocument(id, {
      document_status: !document_status,
    });
    if (res.success) {
      const index: number = state.findIndex((obj: any) => obj.id === id);
      const newArray: any[] = [...state];
      newArray[index] = res.data;
      setState(newArray);
      if (id === docToEdit.id) {
        setDocToEdit(res.data);
      }
    }
  };

  const handleDocumentToEdit = (row: any) => {
    setDocToEdit(row);
    setShowModal(true);
  };

  const handleFileToPreview=(doc:any)=>{
    setFileToPreview(doc)
  }

  useEffect(() => {
    handleFetchCarryTemplateDocuments();
  }, []);

  return (
    <div>
      <TopRow>
        <SubTitle></SubTitle>
        {isSidecarAdmin &&
        <PillButton
          background="transparent"
          borderColor="#413c69"
          color="#413c69"
          onClick={() => setShowModal(true)}
        >
          + Add
        </PillButton>
}
      </TopRow>
      <div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(
            handleToggleActivateDoc,
            handleDocumentToEdit,
            handleFileToPreview
          )}
          data={state}
          wordWrap={true}
        />
      </div>
      {showModal && (
        <CreateDocumentModal
          handleCloseModal={handleCloseModal}
          initState={docToEdit}
          handleToggleActivateDoc={handleToggleActivateDoc}
        />
      )}
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

export default CarryTemplateDocs;
