import React, {FunctionComponent} from "react";
import Row from "react-bootstrap/Row";
import StatusPill from "../../../components/StatusPill";
import {StatusPillCol} from "./styles";
import LineTo from 'react-lineto';
import {IFundDetail} from "../../../interfaces/fundDetails";


interface ApplicationStatusesProps {
  applicationStatus: any
  fundDetails: IFundDetail
}

const ApplicationStatuses: FunctionComponent<ApplicationStatusesProps> = (
  {
    applicationStatus,
    fundDetails
  }
) => {
  if (!applicationStatus || !fundDetails) return <></>
  const skipTax = fundDetails.skip_tax;
  return (
    <>
      <div>
        <Row className="mt-3 mb-5">
          <StatusPillCol>
            <StatusPill
              label="Eligibility Decision"
              data={applicationStatus}
              field={'eligibility_decision'}
            />
          </StatusPillCol>
          <StatusPillCol sm={2}>
            <StatusPill
              label="Investment Confirmation"
              data={applicationStatus}
              field={'application_approval'}
            />
          </StatusPillCol>
          <StatusPillCol>
            <StatusPill
              label="KYC/AML"
              data={applicationStatus}
              field={'kyc_aml'}
            />
          </StatusPillCol>
          {!skipTax && <StatusPillCol>
            <StatusPill
              label="Tax Review"
              data={applicationStatus}
              field={'taxReview'}
            />
          </StatusPillCol>}
          {fundDetails.enable_internal_tax_flow && <StatusPillCol>
            <StatusPill
              label="Internal Tax"
              data={applicationStatus}
              field={'internal_tax'}
            />
          </StatusPillCol>}
          <StatusPillCol>
            <StatusPill
              label="Final Review"
              data={applicationStatus}
              field={'legalDocs'}
            />
          </StatusPillCol>
          <LineTo from="eligibility_decision" to="application_approval" borderColor={'#4a47a3'} borderWidth={2}/>
          <LineTo from="application_approval" to="kyc_aml" borderColor={'#4a47a3'} borderWidth={2}/>
          {!skipTax && <LineTo from="kyc_aml" to="taxReview" borderColor={'#4a47a3'} borderWidth={2}/>}
          {!skipTax && <LineTo from="taxReview" to="legalDocs" borderColor={'#4a47a3'} borderWidth={2}/>}
          {skipTax && <LineTo from="kyc_aml" to="legalDocs" borderColor={'#4a47a3'} borderWidth={2}/>}
        </Row>
      </div>
    </>
  );
};

export default ApplicationStatuses;
