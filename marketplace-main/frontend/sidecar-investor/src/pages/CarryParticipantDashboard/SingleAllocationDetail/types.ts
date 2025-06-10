export interface ICarryAllocationDocument {
    carry_document_name: string;
    document: {
        document_id: string;
        title: string;
    }
    type: string
    carry_document_description: string
    display_name: string
    status: string
    document_type_display: string
}