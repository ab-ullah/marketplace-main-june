import React, {FunctionComponent} from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {IUser} from "../../interfaces";


interface UserRowProps {
  user: IUser,
}


const UserRow: FunctionComponent<UserRowProps> = ({user}) => {
  return <TableRow key={`${user.user_id}-row`}>
    <TableCell component="th" scope="row">{user.email}</TableCell>
    <TableCell align="left">{user.user_id}</TableCell>
    <TableCell align="left">{user.logins_count}</TableCell>
  </TableRow>
};

export default UserRow;
