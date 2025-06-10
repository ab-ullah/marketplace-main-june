import React, {FunctionComponent} from 'react';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import DeleteIcon from '@material-ui/icons/Delete';

interface DeleteButtonProps {
  title: string;
  message: string;
  onConfirm: () => void
}


const DeleteButton: FunctionComponent<DeleteButtonProps> = ({title, message, onConfirm}) => {
  const submit = () => {
    confirmAlert({
      title: title,
      message: message,
      closeOnEscape: true,
      closeOnClickOutside: true,
      buttons: [
        {
          label: 'Yes',
          onClick: onConfirm
        },
        {
          label: 'No',
          onClick: () => {
          }
        }
      ]
    });
  };

  return <DeleteIcon onClick={submit} className={'cursor-pointer'}/>
};

export default DeleteButton;
