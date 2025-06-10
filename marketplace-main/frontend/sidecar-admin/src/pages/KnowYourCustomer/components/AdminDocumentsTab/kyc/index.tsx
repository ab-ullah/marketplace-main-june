import React, {FunctionComponent} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {selectApplicationInfo} from "../../../selectors";
import Col from "react-bootstrap/Col";
import {useAppDispatch, useAppSelector} from "../../../../../app/hooks";
import KycWithDocuments from "./kycDocuments";
import {useGetKYCDocumentsQuery} from "../../../../../api/rtkQuery/kycApi";
import {IKycRecord} from "../../../../../interfaces/kycRecord";
import {fetchKYCRecords} from "../../../thunks";


interface AdminDocumentsProps {
}


const AdminDocuments: FunctionComponent<AdminDocumentsProps> = () => {
  const applicationInfo = useAppSelector(selectApplicationInfo);
  const {data: kycRecords, refetch} = useGetKYCDocumentsQuery(applicationInfo?.id, {skip: !applicationInfo});
  const dispatch = useAppDispatch()

  const refetchKycRecord = () => {
    if (!applicationInfo) return;
    dispatch(
      fetchKYCRecords({
        workflowSlug: applicationInfo.kyc_wf_slug,
        recordId: applicationInfo.kyc_record,
      })
    );
  }

  if (!applicationInfo) return <></>

  return <Container>
    <Row>
      {kycRecords?.map((kycRecord: IKycRecord) => <Col md={12}>
        <KycWithDocuments
          kycRecord={kycRecord}
          refetchKycDocuments={refetch}
          refetchKycRecord={refetchKycRecord}
        />
      </Col>)}
    </Row>

  </Container>
};

export default AdminDocuments;
