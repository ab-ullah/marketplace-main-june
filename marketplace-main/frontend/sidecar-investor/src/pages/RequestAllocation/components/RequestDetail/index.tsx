import React, {FunctionComponent, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Col from "react-bootstrap/Col";
import TableHead from "@material-ui/core/TableHead";
import {IFundDetail} from "../../../../interfaces/fundDetails";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {Heading} from "../../../../presentational/Heading";
import {SideCarStyledTable} from "../../../../presentational/StyledTableContainer";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import Select from "react-select";
import RequestAllocationModal from "../ConfirmationModal";
import CurrencyInput from "../../../../components/Form/CurrencyInput";
import {IOwnershipOrder} from "../../../../interfaces/investorOwnership";

interface RequestDetailProps {
  fund: IFundDetail;
  investorId: number;
  requestedAllocation: IOwnershipOrder | null | undefined;
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});


const RequestDetail: FunctionComponent<RequestDetailProps> = ({fund, investorId, requestedAllocation}) => {
  const currencySymbol = fund.currency?.symbol;
  const [amount, setAmount] = useState<number>(
    requestedAllocation ?
      requestedAllocation.requested_allocation - requestedAllocation.requested_leverage :
      0
  );
  const [leverageRole, setLeverageRole] = useState<number | null | undefined>(requestedAllocation?.used_role_leverage);
  const requestAllocationId = requestedAllocation?.id
  const classes = useStyles();
  const getLeverageSelectedValue = () => {
    return fund.leverage_options.find((option) => parseInt(option.value) === leverageRole
    )
  }

  const getLeverageMultiplier = () => {
    let leverageMultiplier = 0;
    if (leverageRole) {
      const leverageRoleDetails = getLeverageSelectedValue();
      if (leverageRoleDetails) leverageMultiplier = leverageRoleDetails.multiplier;
    }
    return leverageMultiplier;
  }

  const getTotalValue = () => {
    const leverageMultiplier = getLeverageMultiplier();
    return amount + leverageMultiplier * amount
  }

  const leverageSelectedValue = getLeverageSelectedValue()

  return <Container fluid>
    <Row>
      <Col md={12}>
        <Heading>Confirm Investment Amount and Leverage</Heading>
      </Col>
    </Row>
    <Row>
      <SideCarStyledTable>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Leverage Ratio You Are Eligible</TableCell>
                <TableCell align="left">Interest Rate</TableCell>
                <TableCell align="left">Investment Minimum</TableCell>
                <TableCell align="left">Requested Equity Allocation</TableCell>
                <TableCell align="left">Requested Leverage</TableCell>
                <TableCell align="left">Total Commitment</TableCell>
                <TableCell align="left">Anticipated First Capital Call Date</TableCell>
                <TableCell align="left">Anticipated First Capital Call Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="left">{fund.user_leverage}</TableCell>
                <TableCell align="left">2%</TableCell>
                <TableCell align="left"><FormattedCurrency value={1000} symbol={currencySymbol}/></TableCell>
                <TableCell align="left"><CurrencyInput
                  value={amount}
                  name={'amount'}
                  placeholder={'Equity Allocation'}
                  onChange={(name: string, value: any) => setAmount(parseInt(value))}
                  symbol={currencySymbol}
                /></TableCell>
                <TableCell align="left">
                  <Select
                    onChange={(option) => setLeverageRole(option ? parseInt(option.value) : null)}
                    className="basic-single"
                    classNamePrefix="select"
                    options={fund.leverage_options}
                    menuPosition={'fixed'}
                    value={leverageSelectedValue}
                  />
                </TableCell>
                <TableCell align="left"><FormattedCurrency value={getTotalValue()} symbol={currencySymbol}/></TableCell>
                <TableCell align="left">{fund.anticipated_first_call_date}</TableCell>
                <TableCell align="left"><FormattedCurrency value={getTotalValue() / 2} symbol={currencySymbol}/></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </SideCarStyledTable>
    </Row>
    <Row>
      <Col md={12}>
        <RequestAllocationModal
          currencySymbol={currencySymbol}
          requestAllocationId={requestAllocationId}
          fund={fund}
          investment={amount}
          leverageAmount={amount * getLeverageMultiplier()}
          leverageRole={leverageRole}
          investorId={investorId}
        />
      </Col>
    </Row>
  </Container>
};

export default RequestDetail;
