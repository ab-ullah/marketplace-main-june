export interface IAgreementDocument {
  document_id: string;
  title: string;
}

export interface IApplicationWitness {
  id: number;
  application: number;
  name: string;
  email: string;
}

export interface IAgreementDocumentWitness {
  completed: boolean
}

export interface IApplicantAgreement {
  envelope_id: string;
  id: number;
  completed: boolean;
  document: IAgreementDocument;
  agreement_witness: IAgreementDocumentWitness;
  status: string;
}

export interface IRequesterInfo {
  first_name: string;
  last_name: string;
  completed: boolean;
}