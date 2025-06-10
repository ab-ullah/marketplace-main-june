import { each, filter, find, get } from "lodash";
import * as XLSX from "xlsx";
import { KYC_INVESTOR_TYPE } from "../../../KnowYourCustomer/constants";

class AmlKYCReport {
  private reportData;
  private countries;
  private filename;

  constructor(reportData: any, countries: any, filename: string) {
    this.reportData = reportData;
    this.countries = countries;
    this.filename = filename;
  }

  downloadAmlKycReport = () => {
    const { getIndividualAmllKycReport, getEntityAmllKycReport, filename } = this;
    const new_workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      new_workbook,
      getIndividualAmllKycReport(),
      "Individual"
    );
    XLSX.utils.book_append_sheet(
      new_workbook,
      getEntityAmllKycReport(),
      "Entity"
    );

    XLSX.writeFile(new_workbook, `${filename}.xlsx`);
  };

  getIndividualAmllKycReport = () => {
    const { reportData, getIndividualRow } = this;
    const IndividualRecords = filter(
      reportData,
      (application) =>
        get(application, "kyc_record.kyc_investor_type") === KYC_INVESTOR_TYPE.INDIVIDUAL
    );
    const rows = [];
    rows.push([
      "Source",
      "Unique Id",
      "Forename",
      "Surname",
      "Date of birth",
      "year of birth",
      "Address 1",
      "City",
      "Region",
      "Postal code",
      "Country",
      "Nationality",
      "ID Issuing Country",
      "ID Document Type",
      "ID Expiration",
      "Comments",
    ]);
    each(IndividualRecords, (record,index) =>
      rows.push(getIndividualRow(get(record, "kyc_record"), get(record, "internal_comments")))
    );
    return XLSX.utils.aoa_to_sheet(rows);
  };

  getIndividualRow = (record: any, comments: any) => {
    const { countries } = this;
    return [
      "Sidecar",
      get(record, "uuid"),
      get(record, "first_name"),
      get(record, "last_name"),
      get(record, "date_of_birth"),
      get(record, "date_of_birth"),
      get(record, "home_address"),
      get(record, "home_city"),
      get(record, "home_state"),
      get(record, "home_zip"),
      get(
        find(
          countries,
          (country: any) => country.id === get(record, "home_country")
        ),
        "label"
      ),
      get(
        find(
          countries,
          (country: any) => country.id === get(record, "citizenship_country")
        ),
        "label"
      ),
      get(
        find(
          countries,
          (country: any) => country.id === get(record, "id_issuing_country")
        ),
        "label"
      ),
      get(record, 'id_document_type'),
      get(record, 'id_expiration_date'),
      comments
    ];
  };

  getEntityAmllKycReport = () => {
    const { reportData, getEntityRow } = this;
    const entityRecords = filter(
      reportData,
      (application) =>
        get(application, "kyc_record.kyc_investor_type") !== KYC_INVESTOR_TYPE.INDIVIDUAL
    );
    const rows = [];
    rows.push([
      "Source",
      "Unique Id",
      "Name",
      "Registered address",
      "Address 1",
      "City",
      "Region",
      "Postal code",
      "Country",
      "ID Issuing Country",
      "ID Document Type",
      "ID Expiration",
      "Comments",
    ]);
    each(entityRecords, (record) =>
      rows.push(getEntityRow(get(record, "kyc_record"), get(record, 'internal_comments')))
    );
    return XLSX.utils.aoa_to_sheet(rows);
  };

  getEntityRow = (record: any, comments: any) => {
    const { countries, reportData } = this;
    return [
      "Sidecar",
      get(record, "uuid"),
      get(record, "entity_name"),
      get(record, "registered_address"),
      get(record, "home_address"),
      get(record, "home_city"),
      get(record, "home_state"),
      get(record, "home_zip"),
      get(
        find(
          countries,
          (country: any) => country.id === get(record, "jurisdiction")
        ),
        "label"
      ),
      get(
        find(
          countries,
          (country: any) => country.id === get(record, "id_issuing_country")
        ),
        "label"
      ),
      get(record, 'id_document_type'),
      get(record, 'id_expiration_date'),
      comments,
    ];
  };
}

export default AmlKYCReport;
