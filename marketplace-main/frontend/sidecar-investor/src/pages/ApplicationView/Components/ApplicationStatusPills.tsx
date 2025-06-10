import React, {FunctionComponent, useEffect, useState} from "react";
import {IApplicationModuleStates} from "../../../interfaces/applicationStatus";
import Row from "react-bootstrap/Row";
import StatusPill from "../../../components/StatusPill";
import {StatusPillCol} from "./styles";
import LineTo from 'react-lineto';
import {IFundDetail} from "../../../interfaces/fundDetails";
import get from "lodash/get";
import {PRE_DOCUMENT_STAGE_WORKFLOW_ID} from "./constants";


interface ApplicationStatusesProps {
  applicationStatus: IApplicationModuleStates
  fundDetails: IFundDetail
}

const ApplicationStatuses: FunctionComponent<ApplicationStatusesProps> = (
  {
    applicationStatus,
    fundDetails
  }
) => {

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!applicationStatus || !fundDetails) return <></>
  const skipTax = fundDetails.skip_tax;
  const hasPreDocumentWorkFlow = get(fundDetails, `enabled_workflows.${PRE_DOCUMENT_STAGE_WORKFLOW_ID}`);

  return (
    <>
      <div>
        <Row className="mt-3 mb-5">
          {!hasPreDocumentWorkFlow && <StatusPillCol>
            <StatusPill
              label="Eligibility Decision"
              data={applicationStatus}
              field={'eligibility_decision'}
            />
          </StatusPillCol>}
          {!hasPreDocumentWorkFlow && <StatusPillCol >
            <StatusPill
              label="Application Approval"
              data={applicationStatus}
              field={'application_approval'}
            />
          </StatusPillCol>}
          <StatusPillCol>
            <StatusPill
              label="KYC/AML"
              data={applicationStatus}
              field={'kyc_aml'}
            />
          </StatusPillCol>
          {!skipTax && !hasPreDocumentWorkFlow && <StatusPillCol>
            <StatusPill
              label="Tax Review"
              data={applicationStatus}
              field={'taxReview'}
            />
          </StatusPillCol>}
          {hasPreDocumentWorkFlow && <StatusPillCol>
            <StatusPill
              label="Pre Document Flow"
              data={applicationStatus}
              field={'pre_document_stage'}
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
          {!hasPreDocumentWorkFlow && <>
            <LineTo from="eligibility_decision" to="application_approval" borderColor={'#4a47a3'} borderWidth={2}/>
            <LineTo from="application_approval" to="kyc_aml" borderColor={'#4a47a3'} borderWidth={2}/>
            {!skipTax && <LineTo from="kyc_aml" to="taxReview" borderColor={'#4a47a3'} borderWidth={2}/>}
            {!skipTax && <LineTo from="taxReview" to="legalDocs" borderColor={'#4a47a3'} borderWidth={2}/>}
            {skipTax && <LineTo from="kyc_aml" to="legalDocs" borderColor={'#4a47a3'} borderWidth={2}/>}
          </>}
          {hasPreDocumentWorkFlow && <>
            <LineTo from="kyc_aml" to="pre_document_stage" borderColor={'#4a47a3'} borderWidth={2}/>
            <LineTo from="pre_document_stage" to="legalDocs" borderColor={'#4a47a3'} borderWidth={2}/>
          </>}

        </Row>
      </div>
    </>
  );
};

export default ApplicationStatuses;
