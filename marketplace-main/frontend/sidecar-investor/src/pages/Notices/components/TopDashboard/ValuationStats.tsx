import React, {FunctionComponent} from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import {Card} from "react-bootstrap";
import { useAppSelector } from "../../../../app/hooks";
import { selectNoticesValuation } from "../../selectors";
import { getColor } from "./utils";
import ValuationPieChart from "./ValuationPieChart";
import { get, orderBy } from "lodash";
import { ListValueWarpper, ScrollableList, StyledCard } from "./styles";


interface ValuationStatsParams {
}


const ValuationStats: FunctionComponent<ValuationStatsParams> = () => {
  const noticeValuationsResponse = useAppSelector(selectNoticesValuation);
  const transactions = get(noticeValuationsResponse, 'transactions', []);
  const orderedTransactions = orderBy(transactions, ['net_asset_value_usd'], ['desc']);
  const hasData = transactions.length;

  if(!hasData) return null;

  return <StyledCard className="hero-card">
    <Card.Body>
      <Row>
        <Col>
          <h5 className="hero-card-heading">Portfolio Value</h5>
        </Col>
      </Row>
      <Row>
         <Col>
          <ScrollableList>
            {
              orderedTransactions.map((transaction: any, index: number) => {
                return <li>
                <span className="list-heading">{transaction.firm_name}</span>
                <ListValueWarpper color={getColor(index)} className="list-value">
                  {
                    transaction.net_asset_value_usd ? <FormattedCurrency value={transaction.net_asset_value_usd} /> : '-'
                  }
                </ListValueWarpper>
                </li>;
              })
            }
          </ScrollableList>
          </Col>
        <Col>
          <ValuationPieChart notices={noticeValuationsResponse} />
        </Col>
      </Row>
    </Card.Body>
  </StyledCard>
}

export default ValuationStats;