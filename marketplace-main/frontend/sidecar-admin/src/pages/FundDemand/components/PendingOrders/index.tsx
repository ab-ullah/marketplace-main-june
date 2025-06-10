import React, {FunctionComponent} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Col from "react-bootstrap/Col";
import {PENDING} from "../../../../constants/orderStates";
import TableHead from "@material-ui/core/TableHead";
import PendingOrderRow from "./PendingOrderRow";
import {IFundDetail} from "../../../../interfaces/fundDetails";

interface PendingOrderProps {
  fund: IFundDetail
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const PendingOrders: FunctionComponent<PendingOrderProps> = ({fund}) => {

  const pendingOrders = fund.fund_orders.filter((order) => order.status === PENDING);
  const classes = useStyles();

  return <Col md={12} className={'mb-3'}>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="left">Demand</TableCell>
            <TableCell align="left">Leverage Demand</TableCell>
            <TableCell align="left">Total</TableCell>
            <TableCell align="left">Sell</TableCell>
            <TableCell align="left">Total</TableCell>
            <TableCell align="left">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingOrders.map(order => <PendingOrderRow key={order.id} order={order} externalId={fund.external_id}/>)}
        </TableBody>
      </Table>
    </TableContainer>
  </Col>
};

export default PendingOrders;
