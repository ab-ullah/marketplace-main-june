import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import includes from "lodash/includes";
import filter from "lodash/filter";
import map from "lodash/map";
import each from "lodash/each";
import size from "lodash/size";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Select, { OptionTypeBase } from "react-select";
import { eligibilityConfig } from "../../../../utils/EligibilityContext";
import {
  getItemStyle,
  getListStyle,
  reorder,
  sortCriteriaBlocks,
} from "../../../../utils/sortCriteriaBlocks";
import DocumentDropZone from "../../../../../../../../components/FileUpload";
import FilePreviewModal from "../../../../../../../../components/FilePreviewModal";
import MissingInfo from "../MissingInfo";
import { IFund } from "../../../../../../../Funds/interfaces";
import API from "../../../../../../../../api/backendApi";
import { CheckboxBlock as StyledCheckbox } from "../../../../../../../../components/Form/styles";
import {
  useGetDocumentsQuery,
  useUpdateDocumentsMutation,
  useGetVehiclesQuery,
} from "../../../../../../../../api/rtkQuery/fundsApi";
import {DropdownWrapper, StyledSelect, useStyles} from "./styles";
import { IFundDocument } from "./interfaces";
import { useGetAdminUsersQuery } from "../../../../../../../../api/rtkQuery/commonApi";
import { GP_SIGNER_GROUP } from "../../../../../../../Funds/components/CreateFund/constants";
import find from "lodash/find";
import { ADMIN_URL_PREFIX } from "../../../../../../../../constants/routes";
import { logMixPanelEvent } from "../../../../../../../../utils/mixPanel";

interface FundDocumentsProps {
  fund: IFund;
  allowEdit?: boolean;
  onUpdateFundDocument?: (document: any) => void
}

const FundDocuments: FunctionComponent<FundDocumentsProps> = ({
  fund,
  allowEdit,
  onUpdateFundDocument
}) => {
  const [sortedBlocks, setSortedBlocks] = useState<any>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<any>({});
  const [selectedSigners, setSelectedSigner] = useState<any>({})
  const [requiredSignatures, setRequiredSignatures] = useState<any>([]);
  const [requiredGPSignatures, setRequiredGPSignatures] = useState<any>([]);
  const { data: documents, refetch } = useGetDocumentsQuery(fund.external_id, {
    skip: !fund.external_id,
  });
  const { data: vehiclesAPIData } = useGetVehiclesQuery(fund.external_id, {
    skip: !fund.external_id,
  });
  const {data: adminUsers} = useGetAdminUsersQuery({});

  const vechilesList = useMemo(() => {
    return map(vehiclesAPIData, (vehicle: any) => {
      return { value: vehicle.id, label: vehicle.display_share_class_vehicle_name,}}
    );
  }, [vehiclesAPIData]);

  const GPSignerUsers = useMemo(() => {
    const GPSigners = filter(adminUsers, (user) => {
      return filter(user.groups, (group) => group.name === GP_SIGNER_GROUP).length > 0
    }
    )
    return map(GPSigners, (user) => {
      return {
        value: user.id,
        label: `${user.user.first_name} ${user.user.last_name}`,
      }}
    )
  }, [adminUsers]);

  useEffect(() => {
    let signersData: any = {};
    each(documents, (doc) => {
      signersData[doc.id] = find(GPSignerUsers, (user) => user.value === doc.gp_signer)
    })
    setSelectedSigner(signersData)
  }, [GPSignerUsers, documents])

  const [updateDocuments] = useUpdateDocumentsMutation();
  const classes = useStyles();

  const uploadFile = async (fileData: any) => {
    const formData = new FormData();
    formData.append("title", fileData.name);
    formData.append("fund_external_id", fund.external_id);
    formData.append("document_file", fileData);
    await API.uploadFundsDocuments(fund.external_id, formData);
    logMixPanelEvent('Added fund document');
    refetch();
  };

  const handleDeleteDocument = async (docId: number) => {
    await API.deleteDocument(docId);
    logMixPanelEvent('Deleted fund document');
    refetch();
  };

  const blocks = useMemo(() => sortCriteriaBlocks(documents), [documents]);

  useEffect(() => {
    setSortedBlocks(blocks);
    let vehiclesData: any = {};
    each(blocks, (block: any) => {
      vehiclesData[block.id] = filter(vechilesList, (type: OptionTypeBase) =>
        includes(block.document_for, type.value)
      );
    });
    setSelectedVehicles(vehiclesData);
  }, [blocks, vechilesList]);

  useEffect(() => {
    const requiredSignDocs = filter(documents, (document: IFundDocument) => {
      return document.require_signature;
    })
    const requiredGPSignDocs = filter(documents, (document: IFundDocument) => {
      return document.require_gp_signature;
    })
    setRequiredSignatures(map(requiredSignDocs, 'id'));
    setRequiredGPSignatures(map(requiredGPSignDocs, 'id'))
  }, [documents, setRequiredSignatures])


  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const items = reorder(
      sortedBlocks,
      result.source.index,
      result.destination.index
    );
    setSortedBlocks(items);
    const apiPayload = {
      externalId: fund.external_id,
      docId: result.draggableId,
      position: result.destination.index + 1,
    };
    updateDocuments(apiPayload);
  };

  const onChangeInvestmentType = (value: any, docId: string) => {
    setSelectedVehicles({
      ...selectedVehicles,
      [docId]: value,
    });
    const documentFor = map(value, "value");
    const apiPayload = {
      docId,
      externalId: fund.external_id,
      document_for: documentFor.length > 0 ? documentFor : [],
    };
    updateDocuments(apiPayload);
  };

  const onSelectSigner = (gp_signer: any, docId: string) => {
    setSelectedSigner({
      ...selectedSigners,
      [docId]: gp_signer,
    });
    const apiPayload = {
      docId,
      externalId: fund.external_id,
      gp_signer: gp_signer.value,
    };
    updateDocuments(apiPayload);
  };

  const handleRequiredSignature = (docId: string) => {
    let isRequired = false;
    let docsId = [];
    if(includes(requiredSignatures, docId)){
      docsId = filter(requiredSignatures, (id) => docId !== id);
    }else{
      docsId = [...requiredSignatures, docId];
      isRequired = true;
    }
    setRequiredSignatures(docsId);
    const apiPayload = {
      docId,
      externalId: fund.external_id,
      require_signature: isRequired,
    };
    updateDocuments(apiPayload);
  }

  const handleRequiredGPSignature = (docId: string) => {
    let isRequired = false;
    let docsId = [];
    if(includes(requiredGPSignatures, docId)){
      docsId = filter(requiredGPSignatures, (id) => docId !== id);
    }else{
      docsId = [...requiredGPSignatures, docId];
      isRequired = true;
    }
    setRequiredGPSignatures(docsId);
    const apiPayload = {
      docId,
      externalId: fund.external_id,
      require_gp_signature: isRequired,
    };
    updateDocuments(apiPayload);
  }

  const hasDocuments = size(documents) > 0;

  return (
    <div>
      {!hasDocuments && (
        <MissingInfo text=" Please upload all the documents that you would like an employee investor to acknowledge before signing their documents." />
      )}
      <h4>Documents to be acknowledged or signed</h4>
      <a href={`/${ADMIN_URL_PREFIX}/funds/${fund?.external_id}/fund-document-fields`} target="_blank">Available Fields</a>
      <DocumentDropZone onFileSelect={uploadFile} disabled={!allowEdit} />
      <div className="mt-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable-left-menu">
            {(provided: any, snapshot: any) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {size(sortedBlocks) > 0 && (
                  <Row className={classes.docWrapper}>
                    <Col className={`${classes.docCell} ps-5`}><b>Document</b></Col>
                    <Col className={classes.docCell}><b>Document for</b></Col>
                  </Row>
                )}
                {map(
                  sortedBlocks,
                  (
                    { id, doc_id, document_id, document_name },
                    index: number
                  ) => (
                    <Draggable
                      key={`fund-docs-${doc_id}`}
                      draggableId={`${id}`}
                      index={index}
                    >
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <Row className={classes.docWrapper}>
                            <Col className={classes.docCell}>
                              <FilePreviewModal
                                documentId={document_id}
                                documentName={document_name}
                                handleDelete={
                                  allowEdit
                                    ? () => handleDeleteDocument(doc_id)
                                    : undefined
                                }
                                handleUpdate={() => {
                                  onUpdateFundDocument && onUpdateFundDocument({ id, document_name })
                                }}
                              />
                              <StyledCheckbox
                                type="checkbox"
                                checked={includes(requiredSignatures, id)}
                                label="Require Signature"
                                value="require_signature"
                                onChange={() => handleRequiredSignature(id)}
                              />
                              <StyledCheckbox
                                type="checkbox"
                                checked={includes(requiredGPSignatures, id)}
                                label="Require GP Signature"
                                value="require_gp_signature"
                                onChange={() => handleRequiredGPSignature(id)}
                              />
                            </Col>
                            <Col className={classes.docCell}>
                              <StyledSelect
                                  placeholder="All Investors"
                                  onChange={(value: any) =>
                                      onChangeInvestmentType(value, id)
                                  }
                                  isMulti
                                  className="basic-single"
                                  classNamePrefix="select"
                                  isSearchable={true}
                                  value={selectedVehicles[id] || null}
                                  name="investmentType"
                                  options={vechilesList || []}
                                  onBlur={() => {}}
                              />
                              {
                                includes(requiredGPSignatures, id) && <DropdownWrapper>
                                <Select
                                placeholder="GP Signer"
                                onChange={(value: any) =>
                                  onSelectSigner(value, id)
                                }
                                className="basic-single"
                                classNamePrefix="select"
                                isSearchable={true}
                                value={selectedSigners[id] || null}
                                name="gp_signer"
                                options={GPSignerUsers || []}
                                onBlur={() => {}}
                              />
                                </DropdownWrapper>
                              }
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Draggable>
                  )
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

FundDocuments.defaultProps = {
  allowEdit: true,
};

export default eligibilityConfig(FundDocuments);
