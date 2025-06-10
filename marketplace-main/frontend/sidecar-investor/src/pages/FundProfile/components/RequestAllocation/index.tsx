import React, {FunctionComponent} from 'react';

import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";
import {IFundWithProfile} from "../../../../interfaces/fundProfile";
import FundInfoTable from "../InfoTable";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import {DASH_DEFAULT_VALUE} from "../../../../constants/defaultValues";
import EligibilityCriteriaModal from "../EligibilityCriteria";


const RequestAllocationParent = styled.div`
  padding: 100px 60px;
`

const MainHeading = styled(Col)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
`


interface RequestAllocationProps {
  fund: IFundWithProfile
}


const RequestAllocation: FunctionComponent<RequestAllocationProps> = ({fund}) => {
  const allocationMappings = [
    {label: 'Dates', path: 'fund_profile.allocation_request_dates'},
    {
      label: 'Minimum', component: <FormattedCurrency value={fund.minimum_investment} symbol={fund.currency?.symbol}
                                                 rate={fund.currency?.rate} replaceZeroWith={DASH_DEFAULT_VALUE}/>
    },
    {
      'label': <EligibilityCriteriaModal fund={fund}/>
    }
  ]

  return <RequestAllocationParent>
    <Row>
      <MainHeading md={12}>Request Allocation</MainHeading>
    </Row>
    <Row>
      <Col md={12}>
        <FundInfoTable fund={fund} mappings={allocationMappings}/>
      </Col>
    </Row>
  </RequestAllocationParent>
};

export default RequestAllocation;
