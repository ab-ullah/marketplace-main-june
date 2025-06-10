import React, { FunctionComponent, useEffect, useState } from "react";
import size from "lodash/size";
import filter from "lodash/filter";
import Col from "react-bootstrap/Col";
import RsuiteTable from "../../../../components/Table/RSuite";
import SidecarModal from "../../../../components/SidecarModal";
import FundDocuments from "../../../EligibilityCriteria/components/EligibilityFormCreation/components/CriteriaForm/components/FundDocuments";
import { useGetFundsQuery } from "../../../../api/rtkQuery/fundsApi";
import API from "../../../../api/backendApi"

import { IFund } from "../../interfaces";
import { getTableColumns } from "./constants";
import {CAN_PUSH_RECORDS_TO_BOOKS} from "../../../../constants/featureFlags";
import EditFundDocument from "../../../EligibilityCriteria/components/EligibilityFormCreation/components/CriteriaForm/components/FundDocuments/EditFundDocument";
import ExportButton from "../../../../components/ExportButton";
import Dropdown from "react-bootstrap/Dropdown";
import styled from "styled-components";

interface FundsListProps {
  filterKey?: string;
  setFinishedLoading?: Function;
}

enum FundType {
    ONBOARDING = "onboarding",
    PORTAL = "portal",
}

const FundsList: FunctionComponent<FundsListProps> = ({
  filterKey,
  setFinishedLoading,
}) => {
  const [editDocumentFund, setEditDocumentFund] = useState<null | IFund>(null);
  const [editFundDocument, setEditFundDocument] = useState<any>(null);
  const [fundType, setFundType] = useState<FundType | null>(FundType.ONBOARDING)
  const [filterTitle, setFilterTitle] = useState<string>("Onboarding Funds")
  const {
    data: fundsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetFundsQuery(fundType, {
    skip: false,
  });

  const [filteredFunds, setFilteredFunds] = useState<IFund[]>([]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (fundsData && size(fundsData) > 0) setFilteredFunds(fundsData);
  }, [fundsData]);

  useEffect(() => {
    API.isFeatureEnabled(CAN_PUSH_RECORDS_TO_BOOKS).then((res) => {
      if(fundsData){
         const arrangedFundData = fundsData.map((obj: IFund) => {
          return { ...obj, can_start_push_records_to_books: res };
        });
        if (filterKey) {
          setFilteredFunds(
              filter(
                  arrangedFundData,
                  (fund) =>
                      fund.name.toLowerCase().includes(filterKey.toLowerCase()) ||
                      (fund.partner_id && fund.partner_id.toLowerCase().includes(filterKey.toLowerCase()))
              )
          );
        } else {
          setFilteredFunds(arrangedFundData);
        }
      }
    })
  }, [filterKey, fundsData]);

  useEffect(() => {
    if (isLoading === false && isFetching === false) {
      setFinishedLoading && setFinishedLoading();
    }
  }, [isLoading, isFetching, setFinishedLoading]);
  return (
    <Col md={12} className={"mb-3"}>
      <span className="d-flex justify-content-end mb-3">
        <Dropdown className="funds-list-dropdown">
          <Dropdown.Toggle variant="outline-primary">
            {filterTitle}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => {
                setFundType(null)
                setFilterTitle("All Funds")
            }} className="delete-link">
                All Funds
            </Dropdown.Item>
            <Dropdown.Item onClick={() => {
                setFundType(FundType.ONBOARDING)
                setFilterTitle("Onboarding Funds")
            }} className="delete-link">
                Onboarding Funds
            </Dropdown.Item>
            <Dropdown.Item onClick={() => {
                setFundType(FundType.PORTAL)
                setFilterTitle("Portal Funds")
            }} className="delete-link">
                Portal Funds
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <ExportButton />
      </span>
      <RsuiteTable
        height="calc(100vh - 288px)"
        allowColMinWidth={true}
        rowSelection={false}
        columns={getTableColumns((fund: IFund) => setEditDocumentFund(fund))}
        data={filteredFunds}
        defaultSortBy='created_at'
        defaultSortType='desc'
        wordWrap={true}
      />
      <SidecarModal
        title={`${editDocumentFund ? editDocumentFund.name : ""} Documents`}
        showModal={editDocumentFund !== null && editFundDocument === null}
        handleClose={() => setEditDocumentFund(null)}
      >
        {editDocumentFund && editDocumentFund.id ? (
          <FundDocuments fund={editDocumentFund} onUpdateFundDocument={(document: number) => {setEditFundDocument(document)}} />
        ) : (
          <></>
        )}
      </SidecarModal>
      <SidecarModal
        title="Update Fund Document"
        showModal={editFundDocument !== null}
        handleClose={() => setEditFundDocument(null)}
      >
        {editFundDocument ? <EditFundDocument 
          fundDocument={editFundDocument}
          fund={editDocumentFund}
          handleClose={() => setEditFundDocument(null)}
          /> : <></>}
      </SidecarModal>
    </Col>
  );
};

export default FundsList;
