import React, {FunctionComponent} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TableHead from "@material-ui/core/TableHead";
import ActiveFundRow from "./ActiveFundRow";
import {IActiveFund} from "../../../../interfaces/adminDashboard";
import {SideCarStyledTable} from "../../../../presentational/StyledTableContainer";

interface IActiveFundTableProps {
  activeFunds: IActiveFund[],
  lastRow: IActiveFund,
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const ActiveFundTable: FunctionComponent<IActiveFundTableProps> = ({activeFunds, lastRow}) => {
  const classes = useStyles();

  return <SideCarStyledTable md={12} className={'mb-3'}>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Investment</TableCell>
            <TableCell align="left">Type</TableCell>
            <TableCell align="left">Current Nav</TableCell>
            <TableCell align="left">No. of Employees Invested</TableCell>
            <TableCell align="left">Committed Capital</TableCell>
            <TableCell align="left">Committed Loans</TableCell>
            <TableCell align="left">Total Committed</TableCell>
            <TableCell align="left">Total Interest Accrued</TableCell>
            <TableCell align="left">Unrealized Gain</TableCell>
            <TableCell align="left">Total Distributions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activeFunds.map((fundRow) => <ActiveFundRow key={fundRow.id} activeFund={fundRow}/>)}
          <ActiveFundRow key={lastRow.id} activeFund={lastRow}/>
        </TableBody>
      </Table>
    </TableContainer>
  </SideCarStyledTable>
};

export default ActiveFundTable;
