import React, {FunctionComponent} from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import DeleteButton from "../../../../components/DeleteIcon";
import API from "../../../../api/backendApi";
import {useAppDispatch} from "../../../../app/hooks";
import {ICompanyToken} from "../../../../interfaces/company";
import {deleteToken} from "../../companiesSlice";
import EditCompanyToken from "../EditFund";

interface TokenRowProps {
  token: ICompanyToken
}

const TokenRow: FunctionComponent<TokenRowProps> = ({token}) => {
  const dispatch = useAppDispatch();

  const performTokenDeletion = async () => {
    await API.deleteToken(token.id)
    dispatch(deleteToken(token.id))
  }

  return <TableRow key={token.id}>
    <TableCell component="th" scope="row">
      {token.company_name}
    </TableCell>
    <TableCell align="left">{token.token}</TableCell>
    <TableCell>
      <DeleteButton
        title={'Delete Token'}
        message={'Are you sure you want to delete this token?'}
        onConfirm={performTokenDeletion}
      />
      <EditCompanyToken companyToken={token}/>
    </TableCell>
  </TableRow>


};

export default TokenRow;
