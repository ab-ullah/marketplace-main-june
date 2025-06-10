import React, {FunctionComponent} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Col from "react-bootstrap/Col";
import {IOrder} from "../../interfaces";

interface OrderTableProps {
  orders: IOrder[]
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const OrderTable: FunctionComponent<OrderTableProps> = ({orders}) => {
  const classes = useStyles();

  return <Col md={12} className={'mb-3'}>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>status</TableCell>
            <TableCell align="left">Requested Allocation</TableCell>
            <TableCell align="left">Requested Leverage</TableCell>
            <TableCell align="left">Approved Allocation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell component="th" scope="row">
                {order.status_name}
              </TableCell>
              <TableCell align="left">{order.requested_allocation}</TableCell>
              <TableCell align="left">{order.requested_leverage}</TableCell>
              <TableCell align="left">{order.approved_allocation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Col>

};

export default OrderTable;
