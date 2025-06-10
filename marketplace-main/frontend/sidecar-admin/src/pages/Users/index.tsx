import React, {FunctionComponent, useEffect, useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useAppDispatch} from "../../app/hooks";
import UsersList from "./components/UsersList";
import {fetchGroups, fetchUsers} from "./thunks";
import { Tab, Tabs } from 'react-bootstrap';
import { StyledTab, TabsWarpper } from './styles';
import GroupsList from './components/GroupsList';

interface UsersProps {
}


const Users: FunctionComponent<UsersProps> = () => {

  const [activeTab, setActiveTab] = useState<string | null>('users')
  const dispatch = useAppDispatch();


  const fetchUserData = async () => {
    await dispatch(fetchUsers());
  }

  const fetchGroupsData = async () => {
    await dispatch(fetchGroups())
  }

  useEffect(() => {
    fetchUserData();
    fetchGroupsData();
  }, [])

  return <Container className="page-container">
    <Row className={'mb-3'}>
      <h3>Users</h3>
    </Row>
    <Row>
      <Col md={12}>
        <TabsWarpper>
          {/* @ts-ignore */}
        <Tabs id="users-and-groups" onSelect={setActiveTab} activeKey={activeTab}>
          <Tab eventKey='users' title="Users" className="create-form-tab">
          <UsersList/>
          </Tab>
          {/* <Tab eventKey='groups' title="Groups" className="create-form-tab">
            <GroupsList />
          </Tab> */}
        </Tabs>
        </TabsWarpper>
      </Col>
    </Row>

  </Container>
};

export default Users;
