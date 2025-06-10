import { useEffect, useState } from "react";
import filter from "lodash/filter";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import { Container, HeaderContainer, Title,FilterBox, InputBox } from "./styles";
import NavableLoader from "../../components/NavableLoader";
import API from "../../api/backendApi";
import AddParticipant from "./components/AddParticipant";
import { useHistory } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import RsuiteTable from "../../components/Table/RSuite";
import { getTableColumns } from "./constants";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-toastify";
import ExportButton from "../../components/ExportButton";

const Participants = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fullAccess, setFullAccess] = useState(false);
  const [participants, setParticipants] = useState<any>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [rowForAction, setRowForAction] = useState<Record<string,any> | null>(null)
  const history = useHistory();

  const handleAccess = async () => {
    const res = await API.getUserInfo();
    if (!res.has_full_access) {
      history.push("/");
    }
    setFullAccess(res.has_full_access);
  };

  const handleFetchParticipants = async (showLoader=true) => {
    if(showLoader) setIsLoading(true)
    const res = await API.getParticipants();
    setParticipants(res);
    setIsLoading(false)
  };

  const handleDelete = async(row: any) => {
    try {
      await API.deleteParticipants(row.id,!row.deleted)
      setParticipants((prev:any)=>prev.map((participant:any)=>{
        if(participant.id===row.id){
          participant.deleted=!participant.deleted
        }
        return participant
      }))
    } catch (error) {
      console.error('Error deleting user:', error);
      setRowForAction(null)
      toast(`Unable to ${row.deleted? "Undelete":"Delete"} ${row.email}` )
    }
   
  };

  const filtered=(data:any)=>{
    if(filterQuery) return filter(
      data,
      (dat:any) => {
        return dat.full_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
            dat.email.toLowerCase().includes(filterQuery.toLowerCase()) ||
            dat.investors
                .map((investor: {investor_account_code: string}) => investor.investor_account_code.toLowerCase())
                .some((accountCode: string) => accountCode.includes(filterQuery.toLowerCase()))
      }
    )
    else return data
  }

  useEffect(() => {
    handleAccess();
    handleFetchParticipants();
  }, []);

  useEffect(()=>{
    setRowForAction(null)
  },[participants])

  return (
    <Container>
      {isLoading || !fullAccess ? (
        <NavableLoader />
      ) : (
        <div>
          <HeaderContainer>
            <Title>Participants</Title>
            <AddParticipant handleRefetch={()=>handleFetchParticipants(false)} />
          </HeaderContainer>
          <Row>
            <Col md={12} className="my-4">
              This is the page of all the participants. To add a new participant click
              the purple Add Participant button.
            </Col>
          </Row>
          <Row>
            <Col
              md={12}
              className="my-4"
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <FilterBox>
                <InputBox
                  type="text"
                  placeholder="Filter"
                  value={filterQuery}
                  onChange={(e: any) => setFilterQuery(e.target.value)}
                />
                <SearchOutlinedIcon />
              </FilterBox>
            </Col>
          </Row>
          <div className="d-flex justify-content-end mb-3">
        <ExportButton
        fileName="participants-list"
        tableColumns={getTableColumns(setRowForAction)}
        data={filtered(participants)}
        />
        </div>
          {rowForAction && (
            <ConfirmationModal
              data={rowForAction}
              handleConfirm={handleDelete}
              handleCancel={() => setRowForAction(null)}
              description={`Are you sure you want to ${rowForAction.deleted? "restore":"delete"} ${rowForAction.email} ?`}
            />
          )}
          <RsuiteTable
            height="400px"
            allowColMinWidth={true}
            wordWrap={true}
            rowSelection={false}
            columns={getTableColumns(setRowForAction)}
            data={filtered(participants)}
          />
        </div>
      )}
    </Container>
  );
};

export default Participants;
