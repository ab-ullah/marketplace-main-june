import React, {FunctionComponent} from 'react';
import {useParams} from "react-router-dom";
import API from "../../../api/backendApi";
import {Params} from "../../TaxForms/interfaces";
import FilePreviewModal from "../../../components/FilePreviewModal";
import {Status} from "../../Agreements/components/ApplicantDocument/styles";
import {FakeLink} from "../../TaxForms/styles";
import {SignatureDoc} from "./styles";
import { useCompanyPrefix } from '../../../utils/hooks';


interface IRequireSignDoc {
  programDocId: number;
  isApplicationView?: boolean;
  setDisabled?: (status: boolean) => void;
  doc: any;
  signedDoc: any;
  completed: boolean;
}

const RequireSignDoc: FunctionComponent<IRequireSignDoc> = ({
                                                              programDocId,
                                                              doc,
                                                              signedDoc,
                                                              completed,
                                                              isApplicationView,
                                                              setDisabled
                                                            }) => {
  const {externalId} = useParams<Params>();
  const {companyPrefix} =useCompanyPrefix()

  const handleSigningUrl = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (completed) return true;
    if (setDisabled) setDisabled(true);
    const {host, protocol} = window.location;
    const returnUrl = encodeURIComponent(
      `${protocol}//${host}${companyPrefix}/investor/funds/${externalId}/program_doc/envelopeId/${isApplicationView ? "application" : "onboarding"}`
    );
    const response = await API.getProgramDocsSigning(externalId, programDocId, returnUrl);
    window.open(response.signing_url, "_self");
    return response;
  };

  const document = signedDoc ? signedDoc : doc.document;

  return (
    <SignatureDoc className={'mt-2'}>

        <FilePreviewModal
          documentId={`${document.document_id}`}
          documentName={document.title}
        >
          <FakeLink
            className="doc-name"
            disabled={completed}
            style={{cursor: completed ? "not-allowed" : "pointer"}}
            onClick={handleSigningUrl}
          >
            {doc.document.title}
          </FakeLink>
        </FilePreviewModal>
        <Status>{completed ? 'Signed' : 'Pending'}</Status>

    </SignatureDoc>
  )
}


export default RequireSignDoc;