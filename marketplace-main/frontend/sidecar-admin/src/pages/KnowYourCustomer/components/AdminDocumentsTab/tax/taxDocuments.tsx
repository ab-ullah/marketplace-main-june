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


interface AdminDocumentsProps {
  taxRecordId: number;
  applicationId: number;
  taxDocuments: ITaxDocument[]
  refetchDocuments: () => void
}


const TaxDocuments: FunctionComponent<AdminDocumentsProps> = ({taxRecordId,applicationId, taxDocuments, refetchDocuments}) => {
  const [loading, setLoading] = useState(false)
  const [updateTaxDocument] = useUpdateTaxDocumentMutation()
  const dispatch = useAppDispatch()

  const performDocumentUpdate = async (documentId: number, payload: any) => {
    setLoading(true)
    await updateTaxDocument({taxRecordId, taxDocumentId: documentId, applicationId, ...payload})
    dispatch(fetchTaxFormsAdmin(taxRecordId));
    setLoading(false)
  }


  if (loading) return <NavableLoader/>

  const numDocuments = size(taxDocuments)
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
          data={taxDocuments}
        />
      </DocumentsTableCol>
    </Row>}

  </>
};

export default TaxDocuments;
