export interface ICommentPayload {
  kyc_record?: number;
  application?: number;
  comment_for: number;
  module: number;
  module_id: number;
  question_identifier: string;
  document_identifier?: string;
  text: string;
}