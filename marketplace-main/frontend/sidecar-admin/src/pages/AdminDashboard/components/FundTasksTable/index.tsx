import React, {FunctionComponent} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TableHead from "@material-ui/core/TableHead";
import FundTaskRow from "./FundTaskRow";
import {IFundTask} from "../../../../interfaces/adminDashboard";
import {SideCarStyledTable} from "../../../../presentational/StyledTableContainer";

interface FundTasksTableProps {
  fundTasks: IFundTask[]
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const FundTasksTable: FunctionComponent<FundTasksTableProps> = ({fundTasks}) => {
  const classes = useStyles();

  return <SideCarStyledTable md={12} className={'mb-3'}>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Investment</TableCell>
            <TableCell align="left">Investment Name</TableCell>
            <TableCell align="left">Type</TableCell>
            <TableCell align="left">Task Date</TableCell>
            <TableCell align="left">Due Date</TableCell>
            <TableCell align="left">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fundTasks.map((fundTask) => <FundTaskRow key={fundTask.id} fundRow={fundTask}/>)}
        </TableBody>
      </Table>
    </TableContainer>
  </SideCarStyledTable>
};

export default FundTasksTable;
