import React, {FunctionComponent, useState} from 'react';
import Col from "react-bootstrap/Col";
import RsuiteTable from "../../../../components/Table/RSuite";
import {getUserColumns} from "../../utils";
import UserModal from './userModal';
import {IUser} from '../../interfaces';
import {useGetUsersQuery} from "../../../../api/rtkQuery/usersApi";
import {Row} from "react-bootstrap";
import {ProgramDocumentDiv} from "../../../../components/CompanyInfo/styles";
import {AddDocumentButton} from "../../../Companies/Details/styles";
import AddIcon from "@material-ui/icons/Add";

interface UserListProps {
}


const UsersList: FunctionComponent<UserListProps> = () => {
  const {data: users} = useGetUsersQuery();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)


  const onSelectUser = (user: any) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const onHide = () => {
    setSelectedUser(null)
    setIsModalOpen(false)
  }

  const onCreateUser = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }


  if (!users) return <></>


  return <>
    <div>
      <Row className={'m-0'}>
        <Col md={6} className={'p-0'}>
          <ProgramDocumentDiv>

          </ProgramDocumentDiv>
        </Col>
        <AddDocumentButton md={6}>
         <div onClick={onCreateUser} className={'add-document-button'}>
           <div><AddIcon/></div><div className={'button-text'}>Add User</div>
         </div>
        </AddDocumentButton>
      </Row>
    </div>
    <RsuiteTable
      height="500px"
      allowColMinWidth={false}
      wordWrap={true}
      rowSelection={false}
      columns={getUserColumns(onSelectUser)}
      data={users}
    />
    <UserModal
      isOpen={isModalOpen}
      onHide={onHide}
      user={selectedUser}
      key={`selected-user-${selectedUser?.id}`}
    />
  </>
};

export default UsersList;
