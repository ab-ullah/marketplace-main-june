import React, {FunctionComponent} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {IFundSale} from "../../../../interfaces/investorOwnership";
import PendingSaleRow from "./PendingOrderRow";
import {SideCarStyledTable} from "../../../../presentational/StyledTableContainer";

interface PendingSalesProps {
  pendingSales: IFundSale[]
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const PendingSales: FunctionComponent<PendingSalesProps> = ({pendingSales}) => {
  const classes = useStyles();

  return <SideCarStyledTable>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Pending Sales</TableCell>
            <TableCell align="left">Requested Sales</TableCell>
            <TableCell align="left">Offers</TableCell>
            <TableCell align="left">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingSales.map((pendingSale) => (
            <PendingSaleRow key={pendingSale.id} pendingSale={pendingSale}/>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </SideCarStyledTable>
};

export default PendingSales;
