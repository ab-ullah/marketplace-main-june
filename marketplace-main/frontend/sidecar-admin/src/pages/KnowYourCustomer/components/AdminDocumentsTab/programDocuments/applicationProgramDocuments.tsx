import React, {FunctionComponent, useState} from 'react';
import Row from "react-bootstrap/Row";
import RsuiteTable from "../../../../../components/Table/RSuite";
import {getDocumentTableColumns} from "./utils";
import NavableLoader from "../../../../../components/NavableLoader";
import {DocumentsTableCol} from "../styles";
import size from "lodash/size";
import {ITaxDocument} from "../../../../../interfaces/tax";
import {useUpdateTaxDocumentMutation} from "../../../../../api/rtkQuery/taxApi";
import {fetchTaxFormsAdmin} from "../../../thunks";
import {useAppDispatch} from "../../../../../app/hooks";
import {IApplicationCompanyDocument} from "../../../../../interfaces/companyDocument";
import {useUpdateProgramDocMutation} from "../../../../../api/rtkQuery/fundsApi";


interface AdminDocumentsProps {
  applicationId: number;
  applicationProgramDocuments: IApplicationCompanyDocument[]
  refetchDocuments: () => void
}


const ApplicationProgramDocuments: FunctionComponent<AdminDocumentsProps> = (
  {
    applicationId,
    applicationProgramDocuments,
    refetchDocuments
  }
) => {
  const [loading, setLoading] = useState(false)
  const [updateProgramDocument] = useUpdateProgramDocMutation()
  const dispatch = useAppDispatch()

  const performDocumentUpdate = async (documentId: number, payload: any) => {
    setLoading(true)
    await updateProgramDocument({applicationId, docId: documentId, ...payload})
    // dispatch(fetchTaxFormsAdmin(taxRecordId));
    setLoading(false)
  }


  if (loading) return <NavableLoader/>

  const numDocuments = size(applicationProgramDocuments)
  return <>
    {numDocuments > 0 && <Row>
      <DocumentsTableCol md={12}>
        <RsuiteTable
          height={`auto`}
          autoHeight={true}
          allowColMinWidth={true}
          wordWrap={true}
          rowSelection={false}
          columns={getDocumentTableColumns(performDocumentUpdate)}
          data={applicationProgramDocuments}
        />
      </DocumentsTableCol>
    </Row>}

  </>
};

export default ApplicationProgramDocuments;
