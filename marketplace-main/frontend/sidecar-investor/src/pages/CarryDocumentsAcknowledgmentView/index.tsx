import React, {FunctionComponent, useEffect, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import API from '../../api/backendApi'
import {H4, Wrapper} from "../../components/StartPage/styles";
import NavableLoader from "../../components/NavableLoader";
import map from "lodash/map";
import {ArrowForward} from "@material-ui/icons";
import {BigTitle, FormContainer, NextButton, StyledForm} from "../TaxForms/styles";
import FilePreviewModal from "../../components/FilePreviewModal";
import {StyledCheckbox} from "../FundDocuments/styles";
import Form from "react-bootstrap/Form";
import uniq from "lodash/uniq";
import includes from "lodash/includes";
import {CarryDocumentBlock} from "./styles";
import size from "lodash/size";
import {useCompanyPrefix} from "../../utils/hooks";
import {ICarryDocument} from "../../interfaces/carryManagement";
import {Container} from "../KnowYourCustomer/styles";
import { limitCarryDecimalPlaces } from "../../utils/currency";
import filter from "lodash/filter";

export interface CarryDocumentsViewProps {
}

const CarryDocumentsAcknowledgementView: FunctionComponent<CarryDocumentsViewProps> = () => {
    const { carryPoolId, ..._ } = useParams<{ carryPoolId: string }>();
    const [carryDocuments, setCarryDocuments] = useState<ICarryDocument[]>([])
    const [acceptedDocs, setAcceptedDocs] = useState<number[]>([]);
    const [isLoadingPendingCarryDocuments, setLoadingPendingCarryDocuments] = useState<boolean>(false)
    const [docViewed, setDocViewed] = useState<number[]>([]);
    const history = useHistory();
    const {companyPrefix} = useCompanyPrefix()
    const signingURL = `${companyPrefix}/investor/carry-plans/documents/signature`

    const handleDocumentsFetch = async ()=> {
        const data = await API.getCarryDocuments()
        const documentsRequireAcknowledgements = filter(
          data, (carryDocument: ICarryDocument) => !carryDocument.is_signature_required
        )
        setCarryDocuments(documentsRequireAcknowledgements)
    }

    const callbackPreviewFile = async (document: ICarryDocument) => {
        setDocViewed(uniq([...docViewed, document.document.id]));
    };

    const isDocViewed = (document: ICarryDocument) => {
        return includes(docViewed, document.document.id);
    };

    function getAcknowledgedIds(documents: ICarryDocument[]): number[] {
        const acknowledgedDocuments = documents.filter(doc => doc.is_acknowledged);
        return acknowledgedDocuments.map(doc => doc.id);
    }


    useEffect(() => {
        setLoadingPendingCarryDocuments(true)
        handleDocumentsFetch().then(() => {
            setLoadingPendingCarryDocuments(false)
        });
    }, [])

    useEffect(() => {
        setAcceptedDocs(getAcknowledgedIds(carryDocuments))
    }, [carryDocuments])

    const saveAcceptedDocs = async (acceptedDocs: number[]) => {
        const promises = acceptedDocs.map((number) => API.acknowledgeCarryDocument(number));

        try {
            return await Promise.all(promises);
        } catch (error) {
            console.error("Error in API call:", error);
            throw error;
        }
    }

    const updateApproval = async (document: {id: number}, e: React.ChangeEvent<HTMLInputElement>) => {
        const isAcknowledged = e.target.checked;
        try {
            await API.acknowledgeCarryDocument(document.id);
            if(isAcknowledged) {
                setAcceptedDocs(prevState => [...prevState, document.id]);
            }
            else {
                setAcceptedDocs(prevState => prevState.filter((docId: any) => docId !== document.id));
            }
        } catch (error) {
            console.error("Error in API call:", error);
            throw error;
        }
    };



    const isDocApproved = (document: any) => {
        return includes(acceptedDocs, document.id);
    };

    const isNextButtonEnable = () => {
        return size(carryDocuments) === size(acceptedDocs);
    };


    if (isLoadingPendingCarryDocuments) {
        return (
            <>
                <Wrapper fluid hasLoader={true}>
                    <NavableLoader/>
                </Wrapper>
            </>
        )
    }

    return (
        <Container>
            <BigTitle>
                Carry Documents
            </BigTitle>


            <StyledForm>
                <FormContainer>
                    <h4 className="mt-5 mb-4 ms-3">I acknowledge I have reviewed</h4>
                    <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
                            {map(carryDocuments, (carryDocument: ICarryDocument) => {
                                return (
                                        <CarryDocumentBlock>
                                            <div>
                                                <H4>
                                                    {carryDocument.carry_plan_name}
                                                </H4>
                                                <p className="mb-0">
                                                    {limitCarryDecimalPlaces(carryDocument.bps)} points allocated
                                                </p>
                                                <p className="mb-0">
                                                    {carryDocument.vesting_schedule.name}
                                                </p>
                                                </div>
                                                <FilePreviewModal
                                                    documentId={carryDocument.completed ? `${carryDocument.signed_document?.document_id}` : `${carryDocument.document.document_id}`}
                                                    documentName={carryDocument.document.title}
                                                    callbackPreviewFile={() => callbackPreviewFile(carryDocument)}
                                                    callbackDownloadFile={() => callbackPreviewFile(carryDocument)}
                                                >
                                                    <StyledCheckbox>
                                                        <Form.Check
                                                            type="checkbox"
                                                            label={carryDocument.document.title}
                                                            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => await updateApproval(carryDocument, e)}
                                                            value={carryDocument.document.document_id}
                                                            checked={isDocApproved(carryDocument)}
                                                            disabled={!isDocViewed(carryDocument)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            id={`approval-${carryDocument.document.id}`}

                                                        />
                                                    </StyledCheckbox>
                                                </FilePreviewModal>
                                        </CarryDocumentBlock>)
                                }
                            )}
                    </div>
                    <NextButton
                        variant="primary"
                        onClick={() => {history.push(signingURL)}}
                        disabled={!isNextButtonEnable()}
                        className={"mt-4"}
                    >
                        Next <ArrowForward />
                    </NextButton>
                </FormContainer>
            </StyledForm>
        </Container>
    );
}

export default CarryDocumentsAcknowledgementView