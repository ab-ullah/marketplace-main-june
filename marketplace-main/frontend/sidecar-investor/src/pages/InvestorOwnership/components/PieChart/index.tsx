import React, {FunctionComponent} from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NavSharePieChart from "./NavSharePieChart";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import {Card} from "react-bootstrap";
import {IFundInvestorDetail, INavBreakDownSection, IOwnershipConfig} from "../../../../interfaces/fundInvestorDetail";
import styled from "styled-components";
import { getDisplayValue } from "../../../../utils/RenderTablesDynamically";

const ListValue = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 19px;
  letter-spacing: 0.02em;
`

const ListValueWarpper = styled(ListValue)`
  color: ${props => props.color}
`


interface PieChartContainerParams {
  totalRow: IFundInvestorDetail
  hasData: boolean,
  ownershipConfig: IOwnershipConfig,
}


const PieChartContainer: FunctionComponent<PieChartContainerParams> = ({totalRow, hasData, ownershipConfig}) => {
  const filterStats = (stats: INavBreakDownSection[]) => {
    return stats?.filter((stat: INavBreakDownSection) => stat.enabled)
  }
  
  if (!ownershipConfig) return <></>

  return <Card className="hero-card">
    <Card.Body>
      <Row>
        <Col>
          <h5 className="hero-card-heading">{ownershipConfig?.chart_stats_heading}</h5>
        </Col>
      </Row>
      <Row>
        {
          filterStats(ownershipConfig?.right_section_stats) && <Col>
          <ul>
            {
              filterStats(ownershipConfig?.right_section_stats)?.map((section: any) => {
                const value = getDisplayValue(totalRow, section, totalRow['currency_symbol'])
                return value ? <li>
                <span className="list-heading">{section.heading}</span>
                <ListValueWarpper color={section.color} className="list-value">
                  {value}
                </ListValueWarpper>
                </li> : null;
              })
            }
          </ul>
          </Col>
        }
        <Col>
          <NavSharePieChart
            totalRow={totalRow}
            sectionLabels={filterStats(ownershipConfig?.right_section_stats)}
            ownershipConfig={ownershipConfig}
          />
        </Col>
      </Row>
    </Card.Body>
  </Card>
}

export default PieChartContainer;