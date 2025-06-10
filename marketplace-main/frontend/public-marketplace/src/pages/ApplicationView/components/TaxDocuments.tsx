import React, { FunctionComponent, useEffect, useState } from "react";
import map from "lodash/map";
import isNil from "lodash/isNil";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { FileAlreadyAdded } from "../../KnowYourCustomer/styles";
import FilePreviewModal from "../../KnowYourCustomer/components/FilePreview";
import {
  CenterMiddleColumn,
  CommentBadge,
  FakeLink,
  SubTitle,
  TaxRow,
} from "../styles";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectAppRecords } from "../../TaxForms/selectors";
import API from "../../../api/marketplaceApi";
import {
  fetchTaxDetails,
  fetchTaxDocuments,
  updateTaxRecord,
} from "../../TaxForms/thunks";
import get from "lodash/get";
import { TAX_RECORD } from "../../../constants/commentModules";
import { selectKYCRecord } from "../../KnowYourCustomer/selectors";
import CommentWrapper from "../../KnowYourCustomer/components/CommentsWrapper";
import { Comment } from "../../../interfaces/workflows";
import { fetchKYCRecord } from "../../KnowYourCustomer/thunks";
import TaxDetailsForm from "./TaxDetails";


const TaxDocuments: FunctionComponent = () => {
  const { taxDocumentsList, appRecords, taxDetails } =
    useAppSelector(selectAppRecords);
  const { answers } = useAppSelector(selectKYCRecord);
  const {externalId} = useParams<{ externalId: string }>();
  const [disableLinks, setDisableLinks] = useState(false);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const { commentsByRecord } = useAppSelector(selectKYCRecord);

  const saveSignedForm = async (envelope_id: string) => {
    setIsLoading(true);
    //@ts-ignore
    await API.saveSignedForm(externalId, envelope_id);
    setIsLoading(false);
  };

  const getUrlParams = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const envelopeId = urlParams.get("envelope_id");
    const event = urlParams.get("event");

    if (envelopeId && event === "signing_complete") {
      saveSignedForm(envelopeId).then(() => {
        if (appRecords[0])
          dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid));
      });
    } else if (envelopeId) {
      if (appRecords[0])
        dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid));
    }
  };

  useEffect(() => {
    getUrlParams();
    //@ts-ignore
  }, []);

  useEffect(() => {
    const [record] = appRecords;
    if (record && record.kyc_record && record.tax_record) {
      dispatch(fetchKYCRecord(record.kyc_record.uuid));
      dispatch(fetchTaxDetails(record.tax_record.uuid));
    }
  }, [appRecords, dispatch]);

  const onDocumentDeletion = async (recordId: number, documentId: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      await API.deleteTaxDocument(recordId, documentId);
      dispatch(fetchTaxDocuments(appRecords[0].tax_record.uuid));
    }
  };

  const signingUrl = async (envelope_id: string, fund: string) => {
    const host = window.location.host;
    const return_url = encodeURIComponent(
      `http://${host}/funds/${fund}/application?envelope_id=${envelope_id}`
    );
    const response = await API.getSigningUrl(envelope_id, return_url);
    window.open(response.signing_url, "_self");
    return response;
  };

  const onDocumentReGenerate = async (
    recordId: number,
    documentId: string,
    form_id: string
  ) => {
    if (
      window.confirm(
        "Are you sure you want to delete and re-generate this file?"
      )
    ) {
      await API.deleteTaxDocument(recordId, documentId);
      const payload = {
        form_id: form_id,
      };
      await API.createEnvelope(taxDetails?.uuid,payload);
      dispatch(fetchTaxDocuments(appRecords[0].tax_record?.uuid));
    }
  };

  const onSubmitTaxDetails = async (values: any) => {
    await dispatch(
      updateTaxRecord({
        recordUUID: appRecords[0].tax_record.uuid,
        values,
      })
    );
    dispatch(fetchTaxDetails(appRecords[0].tax_record.uuid));
  };
  const hasTaxRecord = !isNil(get(appRecords, '0.tax_record')); 
  if (isLoading) return <div>Loading...</div>;
  return (
    <section style={{ padding: "0" }}>
      <SubTitle>Tax Details</SubTitle>
      {hasTaxRecord && taxDetails && answers && (
        <>
          <TaxDetailsForm
            taxDetails={taxDetails}
            kyc_investor_type_name={get(answers, "kyc_investor_type_name", "")}
            onSubmit={onSubmitTaxDetails}
          />
        </>
      )}
      <SubTitle>Tax Forms</SubTitle>
      {map(taxDocumentsList, (item: any) => {
        if (item.completed === "True") {
          const { document_id, title } = item.document;
          const record_id = item.record_id;
          const form_id = item.form.form_id;
          const recordComments = get(
            commentsByRecord,
            `${TAX_RECORD}.${record_id}`
          );
          const formWithVersion = `${item.form.form_id}-${item.form.version}`;
          const questionComments =
            recordComments && recordComments[item.document.document_id];
          const commentByVersion = recordComments && recordComments[formWithVersion];
          const comments =
            questionComments && questionComments[item.document.document_id];
          const fieldComments = commentByVersion && commentByVersion[""]
          return (
            <React.Fragment key={document_id}>
              <TaxRow>
                <label className="field-label-auto">{form_id}</label>
                <CenterMiddleColumn>
                  <FileAlreadyAdded>
                    <FilePreviewModal
                      title={form_id}
                      questionId={document_id}
                      documentName={title}
                      documentId={document_id}
                    />
                    <DeleteOutlineIcon
                      htmlColor="#F42222"
                      onClick={() => onDocumentDeletion(record_id, document_id)}
                    />
                    <AutorenewIcon
                      htmlColor="green"
                      onClick={() =>
                        onDocumentReGenerate(record_id, document_id, form_id)
                      }
                    />
                  </FileAlreadyAdded>
                </CenterMiddleColumn>
                <CommentBadge color="#10AC84">Complete</CommentBadge>
              </TaxRow>
              {/* @ts-ignore */}
              {fieldComments?.map((comment: Comment) => (
                <CommentWrapper key={comment.id} comment={comment} />
              ))}
              {/* @ts-ignore */}
              {comments?.map((comment: Comment) => (
                <CommentWrapper key={comment.id} comment={comment} />
              ))}
            </React.Fragment>
          );
        } else {
          const record_id = item.record_id;
          const recordComments = get(
            commentsByRecord,
            `${TAX_RECORD}.${record_id}`
          );
          const formWithVersion = `${item.form.form_id}-${item.form.version}`;
          const questionComments =
            recordComments && recordComments[formWithVersion];
          const fieldComments: any = questionComments && questionComments[""]
          return (
            <>
            <TaxRow>
              <label className="field-label-auto">{item.form.form_id}</label>
              <CenterMiddleColumn>
                <FileAlreadyAdded>
                  <FakeLink
                    onClick={() => {
                      // @ts-ignore
                      signingUrl(item.envelope_id, externalId);
                      setDisableLinks(true);
                    }}
                    disableLink={disableLinks}
                  >
                    {item.document.title}
                  </FakeLink>
                  <DeleteOutlineIcon
                    htmlColor="#F42222"
                    onClick={() =>
                      onDocumentDeletion(
                        item.record_id,
                        item.document.document_id
                      )
                    }
                  />
                </FileAlreadyAdded>
              </CenterMiddleColumn>
              <CommentBadge>Pending</CommentBadge>
            </TaxRow>
            {/* @ts-ignore */}
            {fieldComments?.map((comment: Comment) => (
              <CommentWrapper key={comment.id} comment={comment} />
            ))}
            </>
          );
        }
      })}
      <div>
        <Link
          //@ts-ignore
          to={{pathname: `/funds/${externalId}/tax`, state: {formNumber: 3,}}}
        >
          Go to Tax Forms
        </Link>
      </div>
    </section>
  );
};

export default TaxDocuments;
