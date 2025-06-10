import { IDocumentDetail } from "../../../../../../../../interfaces/document";

export interface ICarryAllocationDocument {
    carry_document_name: string;
    document: IDocumentDetail
    type: string
    carry_document_description: string
    display_name: string
    status: string
    document_type_display: string
}