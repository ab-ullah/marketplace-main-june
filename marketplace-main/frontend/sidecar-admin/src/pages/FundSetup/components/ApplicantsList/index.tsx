import {
  FunctionComponent,
  memo,
  useMemo,
  useState,
} from "react";
import styled from "styled-components";
import map from "lodash/map";
import size from "lodash/size";
import _filter from "lodash/filter";
import get from "lodash/get";
import Modal from "react-bootstrap/Modal";
import { useHistory } from "react-router-dom";
import { ADMIN_URL_PREFIX } from "../../../../constants/routes";
import { ContentContainer } from "../../styles";
import { User } from "../../../../interfaces/workflows";
import { selectFundDetail } from "../../../FundDetail/selectors";
import { IFundBaseInfo } from "../../../../interfaces/fundDetails";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { stringFoundIn } from "../../../../utils/stringFiltering";
import {withAllApplicantsData} from '../utils'
import RsuiteTable from "../../../../components/Table/RSuite";
import EditApplicant from "./EditApplicant";
import { ContentInner } from "./styles";
import { selectApplicants, selectStatuses } from "../../selectors";
import { fetchApplicantManagementList } from "../../thunks";
import { getColumns } from "./columns"
import WithdrawConfirmation from "./WithdrawConfirmation";
import SelectorField from "./SortPanel";
import {
  WITHDRAWN,
} from "../../../../constants/applicationStatus";
import { IApplicationStatusData } from "../../../../interfaces/application";
import _ from "lodash";

interface Props {
  handleSelectRow: (data: any[]) => void;
  fund: IFundBaseInfo;
  filter: any;
  updateApplicantStatus: (id: number, status: string, data?: IApplicationStatusData) => void;
}

export const PillsWrapper = styled.span`
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 2em;
`;

const initWithDrawApplicant = -1;

const ApplicantsList: FunctionComponent<Props> = ({
  filter,
  fund,
  handleSelectRow,
  updateApplicantStatus,
}) => {
  const [activeApplicantId, setActiveApplicantId] = useState<any>(null);
  const [withdrawConfirmation, setWithdrawConfirmation] = useState(initWithDrawApplicant);
  const [sequentialDataIds,setSequentialDataIds] = useState<any[]>([])
  const history = useHistory();
  const dispatch = useAppDispatch();

  const fundDetails = useAppSelector(selectFundDetail);

  const allRecords = useAppSelector(selectApplicants);
  const applicantStatuses = useAppSelector(selectStatuses);
  const filteredRecords = useMemo(() => {
    if (!allRecords) return [];
    return _filter(withAllApplicantsData(allRecords, applicantStatuses), (record: any) => {
      const user = record.user as User;
      if (
        filter.keyword &&
        !stringFoundIn(
          filter.keyword,
          record.first_name,
          record.last_name,
          user.email,
          record.investor_account_code
        )
      )
        return false;

      if (filter.job_band && !stringFoundIn(filter.job_band, record.job_band))
        return false;

      if (
        filter.office_location &&
        !stringFoundIn(filter.office_location, record.office_location)
      )
        return false;

      if (
        filter.department &&
        !stringFoundIn(filter.department, record.department)
      )
        return false;

      if (
        filter.eligibility_country &&
        !stringFoundIn(filter.eligibility_country, record.eligibility_country)
      )
        return false;

      if (
        filter.application_approval &&
        !stringFoundIn(filter.application_approval, record.application_approval)
      )
        return false;

      if (
        filter.eligibility_decision &&
        !stringFoundIn(filter.eligibility_decision, record.eligibility_decision)
      )
        return false;

      if (
        filter.requested_equity &&
        !stringFoundIn(filter.requested_equity, record.requested_equity)
      )
        return false;

      if (filter.kyc_aml && !stringFoundIn(filter.kyc_aml, record.kyc_aml))
        return false;

      if (
        filter.legalDocs &&
        !stringFoundIn(filter.legalDocs, record.legalDocs)
      )
        return false;

      if (
        filter.taxReview &&
        !stringFoundIn(filter.taxReview, record.taxReview)
      )
        return false;

      return true;
    });
  }, [allRecords, filter, applicantStatuses]);

  const tableColumns = useMemo(() => {
    return getColumns(
      fundDetails,
      setActiveApplicantId,
      updateApplicantStatus,
      setWithdrawConfirmation,

    );
  }, [fundDetails, setActiveApplicantId, updateApplicantStatus, filter]);

  const formattedData = map(filteredRecords, (data: any) => {
    const user = data.user as User;
    return {
      first_name:
        user.first_name ||
        data.first_name ||
        (!user.last_name && user.display_name),
      last_name: user.last_name || data.last_name,
      ...data,
    };
  });

  const callbackRsuiteSequentialDataIds=(dataIds:any[])=>{
    setSequentialDataIds(dataIds)
  }
  const handleModalClose = () => setActiveApplicantId(null);

  const callbackSaveEditApplicant = () => {
    dispatch(fetchApplicantManagementList(fund.external_id))
  };

  const selectedApplicantData = useMemo(() => {
    if (
      formattedData &&
      activeApplicantId > -1 &&
      formattedData.find((elem)=>elem.id===activeApplicantId)
    ) {
      return formattedData.find((elem)=>elem.id===activeApplicantId);
    }
    return null;
  }, [activeApplicantId, formattedData]);

  if (!fundDetails) return <></>

  console.log({formattedData})

  return (
    <>
      <ContentContainer>
        <ContentInner>
          <RsuiteTable
            isLoading={false}
            columns={tableColumns}
            data={formattedData}
            handleSelectRow={(data: any[]) => {
              handleSelectRow(data);
            }}
            defaultSortBy="first_name"
            defaultSortType="asc"
            callbackInternalDataIds={(dataIds) =>
              callbackRsuiteSequentialDataIds(dataIds)
            }
          />
        </ContentInner>
      </ContentContainer>
      <WithdrawConfirmation
        show={withdrawConfirmation > initWithDrawApplicant}
        callbackSubmit={(comment: string) => {
          updateApplicantStatus(withdrawConfirmation, `${WITHDRAWN}`, {
            withdrawn_comment: comment,
          });
        }}
        handleClose={() => {
          setWithdrawConfirmation(initWithDrawApplicant);
        }}
      />
      <Modal
        size={"lg"}
        show={activeApplicantId !== null}
        onHide={handleModalClose}
      >
        <Modal.Header>
          <Modal.Title>Edit Applicant</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {activeApplicantId !== null &&
            (() => {
              const currentApplicantIndex = sequentialDataIds.findIndex(
                (elem) => elem === activeApplicantId
              );

              const handlePrevApplicant = () => {
                if (currentApplicantIndex > 0) {
                  setActiveApplicantId(
                    sequentialDataIds[currentApplicantIndex - 1]
                  );
                }
              };

              const handleNextApplicant = () => {
                if (currentApplicantIndex + 1 < size(sequentialDataIds)) {
                  setActiveApplicantId(
                    sequentialDataIds[currentApplicantIndex + 1]
                  );
                }
              };

              const paginationFooterText = `${
                currentApplicantIndex + 1
              } of ${size(formattedData)}`;

              return (
                <EditApplicant
                  key={activeApplicantId}
                  paginationFooter={paginationFooterText}
                  handlePrev={handlePrevApplicant}
                  handleNext={handleNextApplicant}
                  data={selectedApplicantData}
                  hasMaxLeveredAmount={Boolean(fundDetails.max_levered_commitment_amount)}
                  callbackSaveEditApplicant={callbackSaveEditApplicant}
                  handleFullApplication={() =>
                    history.push(
                      `/${ADMIN_URL_PREFIX}/funds/${fundDetails?.external_id}/applicants/${selectedApplicantData.id}`
                    )
                  }
                  handleClose={handleModalClose}
                />
              );
            })()}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default memo(ApplicantsList);
