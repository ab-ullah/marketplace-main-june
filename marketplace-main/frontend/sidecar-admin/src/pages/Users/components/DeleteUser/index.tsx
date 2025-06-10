import React, {FunctionComponent, useState} from 'react';

import {IUser} from "../../interfaces";
import ConfirmationModal from "../../../Funds/components/FundsList/ConfirmationModal";
import TrashIcon from "@material-ui/icons/DeleteOutlined";
import {useDeleteUserMutation} from "../../../../api/rtkQuery/usersApi";

interface DeleteUserProp {
  user: IUser
}


const DeleteUser: FunctionComponent<DeleteUserProp> = ({user}) => {
  const [deleteClicked, setDeleteClicked] = useState<boolean>(false)
  const [deleteUser] = useDeleteUserMutation()


  const onDelete = async () => {
    deleteUser({userId: user.id})
    setDeleteClicked(false)
  }

  return <>
    <TrashIcon className={'cursor-pointer'} onClick={() => setDeleteClicked(true)}/>
    <ConfirmationModal
      title={`Delete: ${user.email}`}
      showModal={deleteClicked}
      handleClose={() => setDeleteClicked(false)}
      handleSubmit={onDelete}
      submitLabel={'Delete'}
    >
      <h6>Are you sure you want to delete user with email: <i>{user.email}</i></h6>
    </ConfirmationModal>
  </>
};

export default DeleteUser;
