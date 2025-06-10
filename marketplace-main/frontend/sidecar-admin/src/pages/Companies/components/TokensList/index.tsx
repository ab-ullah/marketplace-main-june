import React, {FunctionComponent, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Col from "react-bootstrap/Col";
import {fetchCompanyTokens} from "../../thunks";
import {selectCompanyTokens} from "../../selectors";
import TokenRow from "./TokenRow";


interface TokensListProps {
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const TokensList: FunctionComponent<TokensListProps> = () => {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector(selectCompanyTokens);


  useEffect(() => {
    dispatch(fetchCompanyTokens());
  }, [])

  const classes = useStyles();
  return <Col md={12} className={'mb-3'}>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Company Name</TableCell>
            <TableCell align="left">token</TableCell>
            <TableCell align="left">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokens.map((token) => <TokenRow token={token} key={`token-row-${token.id}`}/>)}
        </TableBody>
      </Table>
    </TableContainer>
  </Col>

};

export default TokensList;
