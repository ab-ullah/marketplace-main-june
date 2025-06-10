import React, {FunctionComponent} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Col from "react-bootstrap/Col";
import TableHead from "@material-ui/core/TableHead";
import FundInvestorRow from "./FundInvestorRow";
import {IFundDetail} from "../../../../interfaces/fundDetails";

interface InvestorsProps {
  fund: IFundDetail
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const Investors: FunctionComponent<InvestorsProps> = ({fund}) => {

  const investors = fund.fund_investors;
  const classes = useStyles();

  return <Col md={12} className={'mb-3'}>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="left">Ownership</TableCell>
            <TableCell align="left">Leverage</TableCell>
            <TableCell align="left">Invested</TableCell>
            <TableCell align="left">Called</TableCell>
            <TableCell align="left">Received</TableCell>
            <TableCell align="left">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {investors.map(investor => <FundInvestorRow key={investor.id} investor={investor}/>)}
        </TableBody>
      </Table>
    </TableContainer>
  </Col>
};

export default Investors;
