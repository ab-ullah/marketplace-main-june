export interface IPaymentDetail{
  account_name: string;
  account_number: string;
  bank_country: number;
  bank_name: string;
  city: string;
  credit_account_name: string;
  credit_account_number: string;
  currency: number;
  have_intermediary_bank: boolean;
  iban_number: string;
  id: number;
  intermediary_bank_name: string;
  intermediary_bank_swift_code: string;
  postal_code: string;
  province: string;
  reference: string;
  routing_number: string;
  state: string;
  street_address: string;
  swift_code: string;
  user: number;
}