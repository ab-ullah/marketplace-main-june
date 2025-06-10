import { Breadcrumb } from "react-bootstrap";
import { PageContainer, PillButton, Title, TopRow } from "../styles";
import { useState, useMemo, useEffect } from "react";
import { SUB_TABS } from "./constants";
import StatsTable from "../StatsTable";
import CarryTemplateDocs from "./components/CarryTemplateDocs";
import CarryParticipantDocs from "./components/CarryParticipantDocs";
import { useGetExportForStats } from "../../../../components/ExportButton";
import API from "../../../../api/backendApi"
import { toast } from "react-toastify";

const DocumentsPage = () => {
  const [tab, setTab] = useState<string>(SUB_TABS.DOCUMENTS);
  const exportButton = useGetExportForStats()
  const [participantsDocsList, setParticipantsDocsList]= useState([])

  const handleFetchCarryParticipantsDocuments = async () => {
    const res = await API.fetchCarryParticipantsDocuments();
    if (res.success) {
      setParticipantsDocsList(res.data);
    }
  };

  const handleReleaseAllDocs =async()=>{
    const res = await API.releaseAllCarryParticipantsDocuments();
    if(res.success){
        toast.success("All carry docs have been released successfully!!")
        handleFetchCarryParticipantsDocuments()
    }
  }

  const tabsConfig = useMemo(
    () => [
      {
        key: SUB_TABS.DOCUMENTS,
        title: "Documents",
        component: <CarryParticipantDocs participantsDocsList={participantsDocsList} refetch={handleFetchCarryParticipantsDocuments}/>,
      },
      {
        key: SUB_TABS.CARRY_TEMPLATE_DOCUMENTS,
        title: "Carry Template Documents",
        component: <CarryTemplateDocs/>,
      },
    ],
    [participantsDocsList]
  );

  useEffect(() => {
    handleFetchCarryParticipantsDocuments();
  }, []);

  const totalUnreleasedDocs = participantsDocsList?.filter((elem: any) => !elem.is_released).length || 0

  return (
    <PageContainer>
      <TopRow>
        <Title>Documents</Title>
        {Boolean(totalUnreleasedDocs)&& tab===SUB_TABS.DOCUMENTS &&
        <PillButton
                borderColor="#4A47A3"
                color="#4A47A3"
                font={{"font-size":"14px", "font-family":"Quicksand Bold"}}
                onClick={() =>
                  handleReleaseAllDocs()
                  }
                  >
                    Release All Documents {`(${totalUnreleasedDocs})`}
                  </PillButton>}
      </TopRow>
      <Breadcrumb>
        {["Carry Management", "Documents"]
          .filter((elem) => elem)
          .map((elem, i) => (
            <Breadcrumb.Item key={elem}>{elem}</Breadcrumb.Item>
          ))}
      </Breadcrumb>
      <StatsTable
        tabsConfig={tabsConfig}
        currentTab={tab}
        handleChangeTab={setTab}
        additionalButtons={[exportButton]}
      ></StatsTable>
    </PageContainer>
  );
};

export default DocumentsPage;
