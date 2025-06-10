import {FunctionComponent, useCallback, useEffect, useState,} from "react";
import size from "lodash/size";
import get from "lodash/get";
import each from "lodash/each";
import isObject from "lodash/isObject";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import FilterModal from "./ApplicantsList/FilterModal";
import {FilterImg} from "./ApplicantsList/styles";
import FilterIcon from "../../../assets/images/filter.svg";
import {IFundBaseInfo} from "../../../interfaces/fundDetails";
import {HeaderWithSearch} from "../../../components/Header";
import {ContentContainer} from "../styles";
import ApplicantsList from "./ApplicantsList";
import StatSection from "../../../components/StatsSection";

import {selectFundDetail} from "../../FundDetail/selectors";
import {
  useGetKYCInvestmentAmountQuery,
  useRemoveSelectedApplicantMutation, useResetApplicantsMutation,
  useUpdateApplicantStatusMutation,
} from "../../../api/rtkQuery/kycApi";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {fetchApplicantManagementList, fetchApplicationStatuses} from "../thunks";
import {selectApplicants, selectFilter, selectStatuses} from "../selectors";

import {APPROVED, DENIED, RESET} from "../../../constants/applicationStatus";
import {resetToDefault, setFilters} from "../fundSetupSlice";
import {ITaskDetail} from "../../../interfaces/Workflow/task";
import {INotificationConfig} from "../../KnowYourCustomer/interfaces";
import {notificationConfig} from "../../KnowYourCustomer/constants";

import NotificationModal from "../../../components/NotificationModal";
import {IApplicationStatusData} from "../../../interfaces/application";
import {isApplicationApproveable, withAllApplicantsData} from "./utils";
import ExportApplicants from "./ExportApplicants";
import Tooltip from "@material-ui/core/Tooltip";
import classNames from "classnames";
import {APPLICATIONS_NOT_REMOVABLE_MESSAGE} from "../constants";
import { useGetMeAdminUserQuery } from "../../../api/rtkQuery/commonApi";

interface Props {
  fund: IFundBaseInfo;
  task: ITaskDetail | null | undefined;
}

const initFilter = {
  keyword: "",
  officeLocation: "",
  jobBandLevel: "",
  department: "",
  region: "",
  applicationApproval: "",
};

const Applicants: FunctionComponent<Props> = ({ fund, task }) => {
  const [showFinalizeModal, setFinalizeModal] = useState(false);
  const [showFilterModal, setFilterModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [notification, setNotification] = useState<INotificationConfig>(notificationConfig.default);
  const fundDetails = useAppSelector(selectFundDetail);
  const { data: investmentData } = useGetKYCInvestmentAmountQuery(fund.external_id);
  const [updateApplicantStatus] = useUpdateApplicantStatusMutation();
  const [resetApplications] = useResetApplicantsMutation();
  const [removeSelectedApplication] = useRemoveSelectedApplicantMutation();
  const applicantStatuses = useAppSelector(selectStatuses);
  const dispatch = useAppDispatch();
  const filter = useAppSelector(selectFilter)
  const {data: userInfo} = useGetMeAdminUserQuery()
  const isFullAccessAdmin = userInfo?.has_full_access
  const isTestEnv = ['dev', 'stage', 'local'].includes(process.env.REACT_APP_ENVIRONMENT as string)
  const offerLeverage = get(fundDetails, 'offer_leverage')

  useEffect(() => {
    dispatch(fetchApplicantManagementList(fund.external_id));
    dispatch(fetchApplicationStatuses(fund.external_id));
  }, [dispatch, fund.external_id]);

  useEffect(() => {
    return () => {
      dispatch(resetToDefault())
    }
  }, [])

  const allRecords = useAppSelector(selectApplicants);

  const updateFilter = (data: any) => {
    const payload = {
      ...filter,
      ...data,
    };
    dispatch(setFilters(payload))
  };

  const handleSubmitFilter = (values: any) => {
    updateFilter(values);
    setFilterModal(false);
  };

  const handleClearFilter = (values: any) => {
    updateFilter(values);
  }

  const handleUpdateSelectedStatus = useCallback(
    (id: number, status: string, additionalData?: IApplicationStatusData) => {
      const data = isObject(additionalData) ? additionalData : {};
      updateApplicantStatus({ ids: [id], status, ...data })
        .then((resp: any) => {
          dispatch(fetchApplicantManagementList(fund.external_id));
          dispatch(fetchApplicationStatuses(fund.external_id));
        })
        .catch((e) => {
          setSelectedRows([]);
        });
    },
    [dispatch, fund.external_id, updateApplicantStatus]
  );

  const handleApplicationsReset = (ids: number[]) => {
    resetApplications({ ids })
      .then((resp: any) => {
        dispatch(fetchApplicantManagementList(fund.external_id));
        dispatch(fetchApplicationStatuses(fund.external_id));
      })
      .catch((e: any) => {
        setSelectedRows([]);
      });
  }

  const handleBulkOperation = (status: number, ids: number[]) => {
    updateApplicantStatus({ ids, status })
      .then((resp: any) => {
        dispatch(fetchApplicantManagementList(fund.external_id));
        dispatch(fetchApplicationStatuses(fund.external_id));
      })
      .catch((e: any) => {
        setSelectedRows([]);
      });
  };

  const removeApplications = () => {
    removeSelectedApplication({fundExternalId: fund.external_id, ids: selectedRows}).then(
      () => {
        dispatch(fetchApplicantManagementList(fund.external_id));
      }
    ).catch((e: any) => {
      setSelectedRows([]);
    });
  }

  const handleSelectedRowsOperation = (status: number) =>
    handleBulkOperation(status, selectedRows);

  const getOptions = (field: string) => {
    const options: any = [];
    each(withAllApplicantsData(allRecords,applicantStatuses), (record: any) => {
      if (get(record, field, false)) {
        options.push({ label: record[field], value: record[field] });
      }
    });
    return options;
  };

  if (!fundDetails) return <></>

  const selectedRowsApproveable = () => {
    for (let applicationId of selectedRows) {
      const application = allRecords.find(application => application.id === applicationId)
      if (application) {
        const status = applicantStatuses && applicantStatuses[applicationId]
        const data = { ...application, ...(status ? status : {}) }
        const canBeApproved = isApplicationApproveable(data)
        if (!canBeApproved) return false
      }
    }
    return true
  }

  const selectedRowsRemovable = () => {
    for (let applicationId of selectedRows) {
      const application = allRecords.find(application => application.id === applicationId)
      if (application) {
        if (!application.is_removable) return false
      }
    }
    return true
  }

  const disableRemoveSelected = !selectedRowsRemovable()
  const statColSize = offerLeverage ? '3' : '6';

  return (
    <ContentContainer>
      <HeaderWithSearch
        title="Applicant Management"
        leftSideComponents={
          <FilterImg
            src={FilterIcon}
            alt="Filter"
            onClick={() => setFilterModal(true)}
          />
        }
        isSubtitle
        onSearch={(keyword: string) => updateFilter({ keyword })}
        searchValue={filter.keyword}
      >
        <FilterModal
          show={showFilterModal}
          options={{
            job_band: getOptions("job_band"),
            office_location: getOptions("office_location"),
            department: getOptions("department"),
            eligibility_country: getOptions("eligibility_country"),
            application_approval: getOptions("application_approval"),
            eligibility_decision: getOptions("eligibility_decision"),
            requested_equity: getOptions("requested_equity"),
            kyc_aml: getOptions("kyc_aml"),
            legalDocs: getOptions("legalDocs"),
            taxReview: getOptions("taxReview")
          }}
          selectedFilter={filter}
          handleSubmitFilter={handleSubmitFilter}
          handleClose={() => setFilterModal(false)}
          handleClearFilter={handleClearFilter}
        />

        <Dropdown>
          <Dropdown.Toggle
            variant="outline-primary"
            disabled={size(selectedRows) === 0}
          >
            Actions
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {selectedRowsApproveable() && <Dropdown.Item
              onClick={() => handleSelectedRowsOperation(APPROVED)}
              className="delete-link"
            >
              Approve selected
            </Dropdown.Item>}
            <Dropdown.Item
              onClick={() => handleSelectedRowsOperation(DENIED)}
              className="delete-link"
            >
              Decline selected
            </Dropdown.Item>
            <Tooltip title={disableRemoveSelected ? APPLICATIONS_NOT_REMOVABLE_MESSAGE : ''} arrow>
              <div>
                <Dropdown.Item
                  onClick={removeApplications}
                  disabled={disableRemoveSelected}
                  className={classNames({'disabled-option': disableRemoveSelected})}
                >
                  Remove Selected
                </Dropdown.Item>
              </div>
            </Tooltip>
            {isTestEnv && isFullAccessAdmin &&
            <Dropdown.Item
              onClick={() => handleApplicationsReset(selectedRows)}
              className="delete-link"
            >
              Reset selected
            </Dropdown.Item>
}
          </Dropdown.Menu>
        </Dropdown>
        <ExportApplicants fund={fund} />
      </HeaderWithSearch>

      <Row className="mb-4">
        <Col sm={statColSize} className="d-flex align-items-stretch">
          <StatSection
            title="Total equity"
            value={get(investmentData, "amount")}
            isCurrency={true}
            currencySymbol={get(fundDetails, 'currency.symbol')}
          />
        </Col>
        {offerLeverage && <Col sm={statColSize} className="d-flex align-items-stretch">
          <StatSection
            title="Total leverage"
            value={get(investmentData, "leverage")}
            isCurrency={true}
            currencySymbol={get(fundDetails, 'currency.symbol')}
          />
        </Col>}
        {offerLeverage && <Col sm={statColSize} className="d-flex align-items-stretch">
          <StatSection
            title="Total Leverage/Target Fund Size"
            value={get(investmentData, "percentage_by_fund_size")}
            isPercentage={true}
            currencySymbol={get(fundDetails, 'currency.symbol')}
          />
        </Col>}
        <Col sm={statColSize} className="d-flex align-items-stretch">
          <StatSection
            title="Total gross investment"
            value={get(investmentData, "total_gross_investment")}
            isCurrency={true}
            currencySymbol={get(fundDetails, 'currency.symbol')}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <ApplicantsList
            fund={fund}
            filter={filter}
            handleSelectRow={setSelectedRows}
            updateApplicantStatus={handleUpdateSelectedStatus}
          />
        </Col>
      </Row>
      <NotificationModal
        title={notification?.title}
        showModal={notification?.show}
        handleClose={() => setNotification(notificationConfig.default)}
      >
        {notification?.msg}
      </NotificationModal>
    </ContentContainer>
  );
};

export default Applicants;
