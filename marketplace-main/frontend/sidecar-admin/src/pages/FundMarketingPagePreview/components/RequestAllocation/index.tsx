import React, {FunctionComponent} from 'react';

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {MainHeading, RequestAllocationParent} from "./styles";
import {IFundMarketingPageDetail} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import AllocationTable from "./AllocationTable";


interface RequestAllocationProps {
  previewFundPage: IFundMarketingPageDetail
}


const RequestAllocation: FunctionComponent<RequestAllocationProps> = ({previewFundPage}) => {

  return <RequestAllocationParent>
    <Row>
      <MainHeading md={12}>Request Allocation</MainHeading>
    </Row>
    <Row>
      <Col md={12}>
        {previewFundPage.request_allocation_criteria.map(allocation => <AllocationTable requestAllocation={allocation} />)}
      </Col>
    </Row>
  </RequestAllocationParent>
};

export default RequestAllocation;
