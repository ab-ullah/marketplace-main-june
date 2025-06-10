import RsuiteTable from "../../../../../components/Table/RSuite";
import { getColumns } from "./constants";
import { TopRow, Title } from "./styles";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import CreateModal from "./components/CreateModal";
import { TAB_NAME as capitalCallsSection } from "../../CapitalCallsSection/constants";
import { TAB_NAME as distributionNoticesSection } from "../../DistributionNoticesSection/constants";

interface ListPageProps {
  tabName: string;
  handleSelectRow: any;
  data: any;
  handleCreate: any;
  isAdmin: boolean;
}

const ListPage = ({
  tabName,
  handleSelectRow,
  data,
  handleCreate,
  isAdmin,
}: ListPageProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const handleHide = () => {
    setShowModal(false);
  };

  const dateField = {
    [capitalCallsSection]: { label: "Due Date", value: "due_date" },
    [distributionNoticesSection]: {
      label: "Distribution Date",
      value: "distribution_date",
    },
  };

  const handleConfirm = async (selectedFile: File, selectedDate: string) => {
    const formData = new FormData();
    formData.append(
      dateField[tabName as keyof typeof dateField].value,
      selectedDate
    );
    formData.append("document_file", selectedFile as File);
    const res = await handleCreate(formData);
    return res;
  };

  return (
    <div>
      <TopRow>
        <Title>{tabName.split("_").join(" ")}</Title>
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create
          </Button>
        )}
      </TopRow>
      <CreateModal
        dateFieldName={dateField[tabName as keyof typeof dateField].label}
        showModal={showModal}
        handleHide={handleHide}
        handleConfirm={handleConfirm}
      />
      <RsuiteTable
        isLoading={false}
        columns={getColumns(tabName, handleSelectRow)}
        data={data}
        rowSelection={false}
      />
    </div>
  );
};

export default ListPage;
