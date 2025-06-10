import React, {FunctionComponent, useMemo, useState} from "react";
import find from "lodash/find";
import get from "lodash/get";
import isNil from "lodash/isNil";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {SubTitle} from "../../../../components/Header/styles";
import {KYC_RECORD} from "../../../../constants/commentModules";
import {selectCountrySelector} from "../../../EligibilityCriteria/selectors";
import {
  DEPARTMENTS,
  INVESTOR_TYPE_OPTIONS
} from "../../../EligibilityCriteriaPreview/components/CountrySelector/constants";
import {selectApplicationInfo, selectKYCState} from "../../selectors";
import Detail from "../BankingDetails/QuestionRow";
import RequestModal from "../RequestModal";
import {IFlagModal} from "../TaxDetails/interfaces";
import {ICountry, IOverviewLabels} from "./constants";
import {COMMENT_CREATED, COMMENT_UPDATED} from "../../../../constants/commentStatus";
import {approveComment} from "../../thunks";
import { useGetOnboardingCustomTextQuery } from "../../../../api/rtkQuery/commonApi";

interface IOverviewProps {
  record: any;
  applicationId: number;
}

const initFlagModal: IFlagModal = {
  show: false,
  requestModalText: "",
  questionId: "",
};

const Overview: FunctionComponent<IOverviewProps> = ({
                                                       record,
                                                       applicationId,
                                                     }) => {
  const dispatch = useAppDispatch();
  const [flagDetails, setFlagDetails] = useState(initFlagModal);
  const countrySelector = useAppSelector(selectCountrySelector);
  const {commentsByRecord, fund} = useAppSelector(selectKYCState);
  const applicationInfo = useAppSelector(selectApplicationInfo);
  const employeeCoInvest = get(fund, 'employee_co_invest')
  const commentsOfThisRecord = get(
    commentsByRecord,
    `${KYC_RECORD}.${record.id}`
  );
  const {data: customTextConig} = useGetOnboardingCustomTextQuery(undefined)

  const investorType = useMemo(() => {
    const type = INVESTOR_TYPE_OPTIONS.find(
      (type) => type.value === get(record, "kyc_investor_type_name", "")
    );
    return type?.label;
  }, [record]);

  const getCountry = (countryId: number) => {
    if (countryId && countrySelector) {
      const country = find(
        countrySelector as ICountry[],
        (country: ICountry) => country.id === countryId
      );
      return country?.label;
    }
  };

  const showFlagModal = (questionId: string) => {
    if (questionId) {
      setFlagDetails({
        show: true,
        questionId,
        //@ts-ignore
        requestModalText: IOverviewLabels[questionId] as string,
      });
    }
  };
  const hideFlagModal = () => setFlagDetails(initFlagModal);

  const getIsFlagged = (field: string) => {
    const question = get(commentsOfThisRecord, field);
    if (!question) return false;
    const comment = get(question, "");
    return !isNil(comment) && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status);
  };

  const getCommentId = (field: string) => {
    const question = get(commentsOfThisRecord, field);
    if (!question) return false;
    const comment = get(question, "");
    return comment?.id
  }

  const handleApproveComment = (commentId: number) => {
    dispatch(approveComment(commentId))
  }

  const getDepartmentReadableName = () => {
    const departmentValue = get(record, "department", "")
    if (!departmentValue) return departmentValue;

    const departmentOption = DEPARTMENTS.find(
      (department) => department.value === departmentValue
    )
    if (!departmentOption) return departmentValue
    return departmentOption.label
  }

  const getComment = (field: string) => {
    const question = get(commentsOfThisRecord, field);
    if (!question) return false;
    const comment = get(question, "");
    return comment
  }

  return (
    <>
      <SubTitle>Overview</SubTitle>
      <Detail
        value={getCountry(get(applicationInfo, "investment_country.id", ""))}
        label={customTextConig?.custom_domicile_text ?? IOverviewLabels.investor_location}
        flagged={getIsFlagged("investor_location")}
        handleClickFlag={() => showFlagModal("investor_location")}
        handleApproveComment={() => handleApproveComment(getCommentId('investor_location'))}
        comment={getComment("investor_location")}
      />

      <Detail
        value={investorType}
        label={IOverviewLabels.kyc_investor_type_name}
        flagged={getIsFlagged("kyc_investor_type_name")}
        handleClickFlag={() => showFlagModal("kyc_investor_type_name")}
        handleApproveComment={() => handleApproveComment(getCommentId('kyc_investor_type_name'))}
        comment={getComment("kyc_investor_type_name")}
      />
      <Detail
        value={get(record, "first_name", "")}
        label={IOverviewLabels.first_name}
        flagged={getIsFlagged("first_name")}
        handleClickFlag={() => showFlagModal("first_name")}
        handleApproveComment={() => handleApproveComment(getCommentId('first_name'))}
        comment={getComment("first_name")}
      />
      <Detail
        value={get(record, "last_name", "")}
        label={IOverviewLabels.last_name}
        flagged={getIsFlagged("last_name")}
        handleClickFlag={() => showFlagModal("last_name")}
        handleApproveComment={() => handleApproveComment(getCommentId('last_name'))}
        comment={getComment("last_name")}
      />
      {employeeCoInvest && <Detail
        value={get(record, "job_title", "")}
        label={IOverviewLabels.job_title}
        flagged={getIsFlagged("job_title")}
        handleClickFlag={() => showFlagModal("job_title")}
        handleApproveComment={() => handleApproveComment(getCommentId('job_title'))}
        comment={getComment("job_title")}
      />}
      {employeeCoInvest && <Detail
        value={getDepartmentReadableName()}
        label={IOverviewLabels.department}
        flagged={getIsFlagged("department")}
        handleClickFlag={() => showFlagModal("department")}
        handleApproveComment={() => handleApproveComment(getCommentId('department'))}
        comment={getComment("department")}
      />}
      {employeeCoInvest && <Detail
        value={get(record, "job_band", "")}
        label={IOverviewLabels.job_band}
        flagged={getIsFlagged("job_band")}
        handleClickFlag={() => showFlagModal("job_band")}
        handleApproveComment={() => handleApproveComment(getCommentId('job_band'))}
        comment={getComment("job_band")}
      />}
      {employeeCoInvest && <Detail
        value={get(applicationInfo, "restricted_time_period", "")}
        label={IOverviewLabels.restrictedTimePeriod}
        flagged={false}
        handleClickFlag={() => {} }
        handleApproveComment={() => {}}
        hideFlag={true}
      />}
      {employeeCoInvest && <Detail
        value={get(applicationInfo, "restricted_geographic_area", "")}
        label={IOverviewLabels.restrictedGeographicArea}
        flagged={false}
        handleClickFlag={() => {} }
        handleApproveComment={() => {}}
        hideFlag={true}
      />}
      <RequestModal
        key={flagDetails.questionId}
        show={flagDetails.show}
        onHide={hideFlagModal}
        fieldValue={flagDetails.requestModalText}
        applicationId={applicationId}
        module={KYC_RECORD}
        moduleId={record.id}
        commentFor={record.user.id}
        questionIdentifier={`${flagDetails.questionId}`}
        commentLabel={flagDetails.requestModalText}
      />
    </>
  );
};

export default Overview;
