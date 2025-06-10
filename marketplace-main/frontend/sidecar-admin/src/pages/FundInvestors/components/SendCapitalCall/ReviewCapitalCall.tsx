import React, {FunctionComponent} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useAppSelector} from "../../../../app/hooks";
import {selectFund} from "../../selectors";
import Button from "react-bootstrap/Button";
import Paper from "@material-ui/core/Paper";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import {SideCarStyledTable} from "../../../../presentational/StyledTableContainer";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import {getCapitalCallAmount, getPercentValue} from "../../../../utils/dollarValue";
import FormattedCurrency from "../../../../utils/FormattedCurrency";


interface ReviewCapitalCallProps {
  callAmount: number;
  setCallDetails: (args0: any) => void
  submitCapitalCall: () => void
}


const ReviewCapitalCall: FunctionComponent<ReviewCapitalCallProps> = ({
                                                                        callAmount,
                                                                        setCallDetails,
                                                                        submitCapitalCall
                                                                      }) => {
  const fund = useAppSelector(selectFund);
  if (!fund) return <></>
  const currencySymbol = fund.currency?.symbol;
  const fundInvestors = fund.fund_investors;

  return <Container>
    <Row>
      <Col md={12}>
        <h4>User Call Amounts</h4>
      </Col>
    </Row>
    <SideCarStyledTable md={12} className={'mb-3'}>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Call Amount</TableCell>
              <TableCell>Ownership Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fundInvestors.map((investor) => <TableRow className={'mt-3'}>
              <TableCell>
                {investor.investor_name}
              </TableCell>
              <TableCell>
                <FormattedCurrency value={getCapitalCallAmount(investor, callAmount)} symbol={currencySymbol}/>
              </TableCell>
              <TableCell>
                {getPercentValue(investor.fund_ownership_percent)}
              </TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
      </TableContainer>
    </SideCarStyledTable>
    <Row className={'mt-3'}>
      <Col md={6}>
        <Button variant={'outline-primary'} onClick={submitCapitalCall}>Confirm Capital Call</Button>
      </Col>
      <Col md={6}>
        <Button variant={'outline-danger'} onClick={() => setCallDetails(null)}>Cancel</Button>
      </Col>
    </Row>

  </Container>
};

export default ReviewCapitalCall;
