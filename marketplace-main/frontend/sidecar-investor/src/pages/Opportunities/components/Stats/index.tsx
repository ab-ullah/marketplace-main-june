import React, {FunctionComponent} from 'react';

import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";
import _ from "lodash";
import {ICompanyStat} from "../../../../interfaces/company";


const NumberSpan = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 80px;
  line-height: 130px;
  color: #AD62AA;
`

const TextSpan = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 30px;
  line-height: 92px;
  color: #AD62AA;
`

interface CompanyStatsProps {
  stats: ICompanyStat[];
}

const separateNumbersChars = (value: string) => value.split(/(\d+)/g)

const CompanyStats: FunctionComponent<CompanyStatsProps> = ({stats}) => {
  const statRows = _.chunk(stats, 2);

  return <>
    {statRows.map((statRow: any[]) => <Row>
      {statRow.map((stat: any) => <Col md={6}>
          <div>{separateNumbersChars(stat.value).map((val) => {
            // @ts-ignore
            if (!isNaN(val)) return <NumberSpan>{val}</NumberSpan>
            return <TextSpan>{val}</TextSpan>
          })}</div>
          <div>
            {stat.label}
          </div>
        </Col>
      )}
    </Row>)}
  </>
};

export default CompanyStats;
