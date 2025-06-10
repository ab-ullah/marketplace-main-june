import React, {FunctionComponent, useEffect, useState} from "react";
import API from '../../api/backendApi'
import NavableLoader from "../../components/NavableLoader";
import {Container} from "../TaxForms/styles";
import {SideCarStyledTable} from "../../presentational/StyledTableContainer";
import Table from "react-bootstrap/Table";
import {ICarryDocument} from "../../interfaces/carryManagement";
import CarryDocumentSigning from "./Components/CarryDocumentSigning";

export interface CarryDocumentsViewProps {
}


const CarryDocumentsSigningView: FunctionComponent<CarryDocumentsViewProps> = () => {
    const [carryDocuments, setCarryDocuments] = useState<ICarryDocument[]>([])
    const [isLoadingPendingCarryDocuments, setLoadingPendingCarryDocuments] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDocumentsFetch = async ()=> {
        const data = await API.getCarryDocuments()
        setCarryDocuments(data)
    }

    useEffect(() => {
        setLoadingPendingCarryDocuments(true)
        handleDocumentsFetch().then(() => {
            setLoadingPendingCarryDocuments(false)
        });
    }, [])

    if (isSubmitting || isLoadingPendingCarryDocuments) return <NavableLoader/>
    if (!carryDocuments) return <></>

    return <Container className={'mt-5'}>
        <div className={'mt-3'}><h2>Carry Documents</h2></div>
        <SideCarStyledTable className={'mt-5'}>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Document Name</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {carryDocuments.filter((carryDocument: ICarryDocument) => carryDocument.is_signature_required).map((carryDocument: ICarryDocument) => {
                    return <CarryDocumentSigning
                        carryDocument={carryDocument}
                        key={carryDocument.id}
                        setIsSubmitting={setIsSubmitting}
                    />
                })}
                </tbody>
            </Table>
        </SideCarStyledTable>
    </Container>

}

export default CarryDocumentsSigningView