import {FunctionComponent} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TableHead from "@material-ui/core/TableHead";
import FundraisingRow from "./FundraisingRow";
import {IActiveFund} from "../../../../interfaces/adminDashboard";
import {SideCarStyledTable} from "../../../../presentational/StyledTableContainer";

interface IActiveFundTableProps {
  fundRaising: IActiveFund[]
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const FundRaisingTable: FunctionComponent<IActiveFundTableProps> = ({fundRaising}) => {
  const classes = useStyles();

  if (!fundRaising) return <></>

  return <SideCarStyledTable md={12} className={'mb-3'}>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Investment</TableCell>
            <TableCell align="left">Type</TableCell>
            <TableCell align="left">Current NAV</TableCell>
            <TableCell align="left">Total Available</TableCell>
            <TableCell align="left"># of Allocation Requests</TableCell>
            <TableCell align="left">Total Allocation Requests</TableCell>
            <TableCell align="left">Close Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fundRaising.map((fundRow) => <FundraisingRow key={fundRow.id} fundRow={fundRow}/>)}
        </TableBody>
      </Table>
    </TableContainer>
  </SideCarStyledTable>
};

export default FundRaisingTable;
