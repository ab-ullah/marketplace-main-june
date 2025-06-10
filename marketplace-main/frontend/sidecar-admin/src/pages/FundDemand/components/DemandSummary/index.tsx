import React, {FunctionComponent} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Col from "react-bootstrap/Col";
import {IFundDetail} from "../../../../interfaces/fundDetails";

interface DemandSummaryProps {
  fund: IFundDetail
}

const useStyles = makeStyles({
  table: {
    minWidth: 150,
  },
});

const FundDemandSummary: FunctionComponent<DemandSummaryProps> = ({fund}) => {
  const classes = useStyles();

  return <Col md={12} className={'mb-3'}>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableBody>
          <TableRow key={`${fund.id}-available`}>
            <TableCell component="th" scope="row">Available
            </TableCell>
            <TableCell align="left">{fund.unsold}</TableCell>
          </TableRow>
          <TableRow key={`${fund.id}-sold`}>
            <TableCell component="th" scope="row">Available
            </TableCell>
            <TableCell align="left">{fund.sold}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Col>
};

export default FundDemandSummary;
