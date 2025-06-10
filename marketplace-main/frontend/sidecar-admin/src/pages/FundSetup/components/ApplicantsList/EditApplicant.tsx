import {FC, memo, useEffect, useMemo, useState} from "react";
import {Formik, FormikHelpers} from "formik";
import * as Yup from "yup";
import get from "lodash/get";
import first from "lodash/first";
import split from "lodash/split";
import map from "lodash/map";
import size from "lodash/size";
import each from "lodash/each";
import compact from "lodash/compact";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {FormTextFieldRow} from "../../../../components/Form/TextField";
import {FormTextAreaRow} from "../../../../components/Form/TextArea";
import {FormSelectorFieldRow} from "../../../../components/Form/SelectorField";
import {DEPARTMENTS, JOB_BANDS} from "../../../EligibilityCriteriaPreview/components/CountrySelector/constants";
import RadioField from "../../../../components/Form/RadioField";
import CurrencyField from "../../../../components/Form/CurrencyField";
import ApplicantPill from "./ApplicantPill";
import {
  ButtonWrapper,
  EditApplicantFooter,
  EditApplicantStatusCol,
  EditApplicantWrapper,
  PaginationIcon,
} from "./styles";
import {
  useUpdateApplicantMutation,
  useUpdateApplicationVehicleAndShareClassMutation,
  useUpdateInvestorCodeMutation,
  useUpdateKYCRecordMutation,
  useUpdateTransfersMutation,
} from "../../../../api/rtkQuery/kycApi";
import {IBaseApplication} from "../../../../interfaces/application";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectVehicles} from "../../selectors";
import {useGetVehiclesQuery} from "../../../../api/rtkQuery/fundsApi";
import {useParams} from "react-router-dom";
import NotificationModal from "./NotificationModal";
import {fetchVehicles} from "../../thunks";
import {selectFundDetail} from "../../../FundDetail/selectors";
import _ from "lodash";
import FormDateField from "../../../../components/Form/DateField";
import moment from "moment";
import {WORKFLOW_PRE_DOCUMENT_SIGNING} from "./constants";

const INITIAL_VALUES = {
  email_address: "",
  first_name: "",
  last_name: "",
  eligibility_decision: "",
  job_band: "",
  requested_leverage: "",
  max_leverage: "",
  final_leverage: "",
  requested_entity: "",
  final_entity: null,
  final_total_investment: "",
  applicationApproval: "",
  kryc_aml: "",
  legalDocs: "",
  taxReview: "",
  internal_tax: "",
  internal_comment: "",
  notify_investor: "",
  investor_account_code: "",
  vehicle: 0,
  share_class: 0,
  equity: 0,
  department: '',
  application_max_levered_amount: 0,
  max_leverage_percentage: 0,
  cashless_commitment: 0,
  final_cashless_commitment: 0
};

const VALIDATION_SCHEMA = Yup.object({
  final_total_investment: Yup.number()
      .typeError("Value should be a number.")
      .required("Required"),
  final_entity: Yup.number()
      .typeError("Value should be a number.")
      .required("Required"),
  requested_leverage: Yup.mixed().required("Required").nullable(),
  final_leverage_ratio: Yup.mixed().required("Required").nullable(),
});

const getRatio = (values: any, key: string) => {
  const data = get(values, `${key}.value`, get(values, key, null));
  return getMultiple(data)
};

const getMultiple = (ratio: string) => {
  const val = first(split(ratio, ":"));
  return _.isNaN(parseInt(`${val}`)) ? 0 : Number(val);
}

export interface IEditApplicant {
  data: IBaseApplication,
  paginationFooter: any,
  callbackSaveEditApplicant: any,
  handleClose: any,
  handleFullApplication?: any,
  handlePrev: any,
  handleNext: any,
  hasMaxLeveredAmount?: boolean,
}

interface IFinalLeverageRatio {
  label:string,
  value:string
}

interface IFormData extends IBaseApplication {
  email_address: string;
  final_entity?: null | number;
  final_leverage_ratio?:  null | IFinalLeverageRatio;
  requested_leverage?:  null | string;
  vehicle?: number;
  investor_account_code?: string;
  eligibility_decision?: string;
  equity: number;
  interest_balance: number;
  interest_date: string | Date;
  loan_balance: number;
  loan_date: string | Date;
  max_leverage_percentage: any;
  final_cashless_commitment: any;
}

const EditApplicant: FC<IEditApplicant> = ({
                                             data,
                                             paginationFooter,
                                             callbackSaveEditApplicant,
                                             handleClose,
                                             handleFullApplication,
                                             handlePrev,
                                             handleNext,
                                             hasMaxLeveredAmount
                                           }) => {
  let paramExternalId = useParams<{ externalId: string }>();
  let externalId

  if (!paramExternalId.externalId){
    const currentURL = window.location.search;
    const searchParams = new URLSearchParams(currentURL);
    externalId = searchParams.get('fund_external_id')
  } else {
    externalId = paramExternalId.externalId
  }

  const dispatch = useAppDispatch();
  const finalEntity=get(data, 'investment_detail.final_entity')

  const generateDateWithOffset=(dateString:string)=>{

    const date = new Date(dateString);
    const time = date.getTime();
    const offset = date.getTimezoneOffset() * 1000 * 60;

    return new Date(time + offset)
  }

  const getDepartmentValue = (label: string) => {
    const optionValue = DEPARTMENTS.find(department => department.label === label)?.value
    return optionValue ? optionValue : label;
  }

  const formData: IFormData  = {
    ...data,
    ...get(data, 'investment_detail'),
    email_address: get(data, 'user.email', ''),
    share_class: get(data, 'share_class.id', INITIAL_VALUES.share_class),
    vehicle: get(data, 'vehicle.id', INITIAL_VALUES.vehicle),
    final_entity: !!finalEntity ? finalEntity.toFixed(2): finalEntity,
    eligibility_decision: get(data, 'eligibility_decision'),
    equity: get(data, 'transfers.equity', 0),
    interest_balance: get(data, 'transfers.interest_balance'),
    interest_date: generateDateWithOffset(get(data, 'transfers.interest_date') as string),
    loan_balance: get(data, 'transfers.loan_balance'),
    loan_date: generateDateWithOffset(get(data, 'transfers.loan_date') as string),
    department: getDepartmentValue(data.department),
    final_leverage_ratio:{label:"",value: JSON.stringify({description: data.investment_detail.final_leverage_option_description ?? '', amount: data.investment_detail.final_leverage_ratio})},
    max_leverage_ratio: data.investment_detail.max_leverage,
    max_leverage_percentage: get(data,'investment_detail.max_leverage_percentage'),
    final_cashless_commitment: get(data,'investment_detail.final_cashless_commitment') || 0,
    requested_leverage: JSON.stringify({description: data.investment_detail.leverage_option_description, amount: data.investment_detail.requested_leverage})
  };
  const [updateApplicantMutation] = useUpdateApplicantMutation();
  const [updateKYCMutation] = useUpdateKYCRecordMutation();
  const [updateInvestorCode] = useUpdateInvestorCodeMutation();
  const [updateApplicationVehicleAndShareClassMutation] = useUpdateApplicationVehicleAndShareClassMutation();
  const [updateTransferMutation] = useUpdateTransfersMutation();
  const {data: vehiclesAPIData} = useGetVehiclesQuery(externalId, {
    skip: !externalId,
  });

  const vehicles = useAppSelector(selectVehicles);
  const [isShowNotificationModal, setIshowNotificationModal] = useState(false);
  const [comment, setComment] = useState('')
  const fundDetails = useAppSelector(selectFundDetail);
  const showCommitmentFlow = Boolean(fundDetails?.show_new_commitment_flow)
  const offerLeverage = Boolean(fundDetails?.offer_leverage)
  const leverageOptions = fundDetails?.leverage_options
  const employeeCoInvest = get(fundDetails, 'employee_co_invest')
  // const cashlessCommitmentAmount = data.investment_detail.final_cashless_commitment || 0
  const offerCashlessCommitment = (!data.disable_cashless_commitment) && (fundDetails?.cashless_commitment_enabled)
  const hasPreDocumentStage = get(fundDetails, `enabled_workflows.${WORKFLOW_PRE_DOCUMENT_SIGNING}`)
  useEffect(() => {
    dispatch(fetchVehicles())
  }, [])

  const getTotalInvestment = (data: {final_entity?:  null | number, investment_detail?: {final_leverage_ratio?: null | string}}) => {

    const finalAmount = parseFloat(`${get(data, "final_entity")}`);
    const finalLeverageRatio = getRatio(data.investment_detail, "final_leverage_ratio");
    if(_.isNaN(finalAmount)) return 0
    const leverage = showCommitmentFlow ? get(data,'final_leverage') : finalAmount * finalLeverageRatio
    const cashlessCommitmentAmount = get(data,'final_cashless_commitment')
    return finalAmount + Number(leverage) + Number(cashlessCommitmentAmount)
    // if(finalAmount && offerCashlessCommitment) return finalAmount + cashlessCommitmentAmount
    // return parseFloat((finalAmount + finalAmount * finalLeverageRatio).toFixed(6));
  }

  const getFinalLeverage = (data: {final_entity?:  null | number, final_leverage_ratio?: null | IFinalLeverageRatio}) => {
    const finalAmount = parseFloat(`${get(data, "final_entity")}`);
    if (data && data.final_leverage_ratio && get(data.final_leverage_ratio, 'value')) {
      const parsed = JSON.parse(get(data.final_leverage_ratio, 'value'))
      const finalLeverageRatio = getMultiple(parsed.amount);
      if(_.isNaN(finalAmount)) return 0
      return parseFloat((finalAmount * finalLeverageRatio).toFixed(6));
    }
  }

  const requireNotification = (values: any) => {
    let finalLeverageRatio = get(values, 'final_leverage_ratio.value')
    const finalEntity = `${get(values, 'final_entity')}`
    if (finalLeverageRatio === undefined) {
      finalLeverageRatio = get(values, 'final_leverage_ratio')
    }
    return finalEntity !== `${get(formData, 'final_entity')}` || finalLeverageRatio !== get(formData, 'final_leverage_ratio')
  }


  const onSubmit = (values: any, { setSubmitting, setFieldError }: FormikHelpers<any>) => {
    setSubmitting(true);
    const vehicle = get(values, 'vehicle')
    const shareClass = get(values, 'share_class')
    let maxLeverageChoice;
    if (get(values, 'max_leverage_ratio') && (get(values.max_leverage_ratio, 'value') || get(values.max_leverage_ratio, 'amount'))){
      if(get(values.max_leverage_ratio, 'value')) {
        if(values.max_leverage_ratio.value === '-1') {
          maxLeverageChoice = null
        } else {
          maxLeverageChoice = getMultiple(values.max_leverage_ratio.value)
        }
      } else {
        maxLeverageChoice = getMultiple(JSON.parse(get(values, 'max_leverage_ratio')?.amount).value)
      }
    } else {
      maxLeverageChoice = getMultiple(values.max_leverage_ratio)
    }
    let final_leverage_ratio_choice;
    let finalLeverageRatio
    let leverageOptionDescription
    if (get(values, 'final_leverage_ratio') && (get(values.final_leverage_ratio, 'value') || get(values.final_leverage_ratio, 'amount'))){
      if(get(values.final_leverage_ratio, 'value')) {
        final_leverage_ratio_choice = JSON.parse(get(values, 'final_leverage_ratio')?.value)
      } else {
        final_leverage_ratio_choice = JSON.parse(get(values, 'final_leverage_ratio')?.amount)
      }
      finalLeverageRatio = getRatio(final_leverage_ratio_choice, "amount")
      leverageOptionDescription = get(final_leverage_ratio_choice, "description", "")
    } else {
      final_leverage_ratio_choice = JSON.parse(values.final_leverage_ratio)
      finalLeverageRatio = getMultiple(final_leverage_ratio_choice.amount)
      leverageOptionDescription = final_leverage_ratio_choice.description
    }
    const kycPayload = {
      recordId: get(data, 'kyc_record'),
      workflowSlug: get(data, 'kyc_wf_slug'),
      job_band: get(values, "job_band"),
      department: get(values, "department"),
    }

    const transfers_payload: any = {};

    let applicationVehicleAndClassPayload: any = {
      vehicle: vehicle ? vehicle : null,
      share_class: shareClass ? shareClass : null,
      comment: comment,
      application_id: data.id,
      max_leverage: maxLeverageChoice,
    }

    if (employeeCoInvest) {
      applicationVehicleAndClassPayload = {
        ...applicationVehicleAndClassPayload,
        restricted_geographic_area: get(values, 'restricted_geographic_area', ''),
        restricted_time_period: get(values, 'restricted_time_period', ''),
        department: get(values, "department"),
        job_band: get(values, "job_band")
      }
    }

    const investorCodePayload = {
      applicationId: data.id,
      investor_account_code: get(values, "investor_account_code", ""),
    }

    let payload: any = {
      final_amount: parseFloat(`${get(values, "final_entity")}`),
      final_leverage_ratio:finalLeverageRatio,
      description: leverageOptionDescription,
      id: get(values, "investment_detail.id"),
      internal_comment: get(values, "internal_comment", ""),
      notify_investor: Boolean(get(values, "notify_investor", false)),
      final_leverage_option_description: leverageOptionDescription,
      max_leverage_percentage: get(values,'max_leverage_percentage')
    };

    if(hasMaxLeveredAmount) payload['max_levered_commitment_amount'] = get(values, "application_max_levered_amount",0)

    if (employeeCoInvest){
      payload['job_band'] = get(values, "job_band")
    }

    if(offerCashlessCommitment){
      payload['final_cashless_commitment'] = get(values,'final_cashless_commitment') || 0
    }

    if (data.has_custom_leverage) {
      payload['final_leverage'] = get(values, "final_leverage_amount")
    }

    if(showCommitmentFlow){
      payload['final_leverage'] = get(values, "final_leverage")
    }

    if (data.has_custom_total_investment) {
      payload['total_investment'] = get(values, "final_total_investment")
    }

    if(data.transfers){
      transfers_payload['id'] = get(data, 'transfers.id');
      transfers_payload['equity'] = get(values, 'equity');
      transfers_payload['interest_balance'] = get(values, 'interest_balance');
      transfers_payload['interest_date'] = moment(get(values, 'interest_date')).format('YYYY-MM-DD');
      transfers_payload['loan_balance'] = get(values, 'loan_balance')
      transfers_payload['loan_date'] = moment(get(values, 'loan_date')).format('YYYY-MM-DD');
    }

    const promises = [
      updateApplicantMutation(payload),
      updateInvestorCode(investorCodePayload),
      updateApplicationVehicleAndShareClassMutation(
          applicationVehicleAndClassPayload
      ),
    ];
    if(data.transfers) promises.push(updateTransferMutation(transfers_payload));
    if(kycPayload.recordId) promises.push(updateKYCMutation(kycPayload))
    Promise.all(promises)
        .then((resp: any) => {
          const errors = compact(map(resp, 'error.data'));
          if (size(errors) > 0) {
            setSubmitting(false);
            each(errors, (error, key) => {
              if(typeof error !== "object") return ;
              each(error, (errorMsg, key) => {
                setFieldError(key, errorMsg);
              });
            });
          } else {
            setSubmitting(false);
            handleClose();
            callbackSaveEditApplicant();
          }
        })
        .catch((e) => {
          setSubmitting(false);
        });
  };

  const getLeverageOptions = (max=null, isFinalizedLeverageOptions=false) => {
    let filteredLeverages: { value: string; label: string; multiple: number; }[] = []
    if(leverageOptions){
       (max ?  leverageOptions.filter((opt)=> Number(opt.amount)<=Number(max)) : leverageOptions).forEach((leverageOption)=>{
        const amount = (leverageOption.amount > 0) ? `${leverageOption.amount}:1` : "None"
        const label = leverageOption.description ? `${amount} - ${leverageOption.description}` : amount
        if(filteredLeverages){
          filteredLeverages.push({
            value: JSON.stringify({description: leverageOption.description, amount: `${leverageOption.amount}:1`}),
            label: label,
            multiple: leverageOption.amount,
          })
        }
      })
    }
    if(max === '-1' && leverageOptions && isFinalizedLeverageOptions) {
      leverageOptions.forEach((leverageOption)=>{
        const amount = (leverageOption.amount > 0) ? `${leverageOption.amount}:1` : "None"
        const label = leverageOption.description ? `${amount} - ${leverageOption.description}` : amount
        if(filteredLeverages){
          filteredLeverages.push({
            value: JSON.stringify({description: leverageOption.description, amount: `${leverageOption.amount}:1`}),
            label: label,
            multiple: leverageOption.amount,
          })
        }
      })
    }
    return filteredLeverages.sort(
        function(a,b){
          const x = a.multiple;
          const y = b.multiple;
          return x-y;
        }
    );
  };

  const getLeverageRatios = () => {
    let filteredLeverages = [{
      value: '-1',
      label: 'No Limit',
      multiple: -1,
    }]
    if(leverageOptions){
      for (const leverageOption of leverageOptions){
        if(filteredLeverages){
          filteredLeverages.push({
            value: `${leverageOption.amount}:1`,
            label: (leverageOption.amount > 0) ? `${leverageOption.amount}:1` : "None",
            multiple: leverageOption.amount,
          })
        }
      }
    }
    return filteredLeverages.filter(
        (element, index, self) => {
          return self.findIndex(o => o.value === element.value) === index
        }
    ).sort(
        function(a,b){
          const x = a.multiple;
          const y = b.multiple;
          return x-y;
        }
    );
  };


  const vehicleOptions = useMemo(() => {
    return vehicles?.map(((vehicle: { name: any; id: any; }) => {
      return {label: vehicle.name, value: vehicle.id}
    }))
  }, [vehicles]);

  const getShareClassOptions = (vehicle_id: number) => {
    return vehiclesAPIData
        ?.filter(
            (val: { company_fund_vehicle: number; fund: number }) =>
                val.company_fund_vehicle === vehicle_id && val.fund === data.fund
        )
        .map(
            (shareClass: {
              display_name: string;
              id: number;
              company_fund_vehicle: number;
            }) => {
              return { label: shareClass.display_name, value: shareClass.id };
            }
        );
  }

  const getOptionById = (options: any, value: any) => {
    return options?.find((option: { value: number; }) => option.value === value)
  }

  const handleSave = (values: any, handleSubmit: any) => {
    if (requireNotification(values)) {
      setIshowNotificationModal(true)
    } else {
      handleSubmit()
      handleClose()
      setIshowNotificationModal(false)
    }
  }

  const getDepartmentOption = (value: string) => {
    return DEPARTMENTS.find(department => department.value === value)
  }

  const skipTax = get(data, 'skip_tax')

  return (
      <>
        <Formik
            validationSchema={VALIDATION_SCHEMA}
            initialValues={data ? {...formData, max_leverage_ratio: formData.max_leverage_ratio ?? '-1'} : INITIAL_VALUES}
            onSubmit={onSubmit}
        >
          {({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              isValid,
              isSubmitting,
              setFieldValue,
              errors,
            }) => {
            // const finalEntity = get(values, "final_entity", 0)
            const finalEntity:any = !!get(values, "final_entity") ? get(values, "final_entity") : ''
            const getMaxLevRatioInt = (maxLeverageRatio: { value: any; }) => (maxLeverageRatio?.value || maxLeverageRatio)?.split(":")?.[0]
            
            return (
                <>
                  <EditApplicantWrapper>
                    <Row>
                      <Col>
                        <FormTextFieldRow
                            label="Email Address"
                            name="email_address"
                            placeholder="Enter Email Address"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.email_address}
                            disabled={true}
                        />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <FormTextFieldRow
                            label="First Name"
                            name="first_name"
                            placeholder="Enter First Name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.first_name}
                            disabled={true}
                        />
                      </Col>
                      <Col>
                        <FormTextFieldRow
                            label="Last Name"
                            name="last_name"
                            placeholder="Enter Last Name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.last_name}
                            disabled={true}
                        />
                      </Col>
                      {employeeCoInvest && <Col className="col_job_band">
                        <FormSelectorFieldRow
                            label="Job Band/Level"
                            name="job_band"
                            placeholder="Select"
                            onChange={(value: any) => {
                              setFieldValue("job_band", value.value);
                            }}
                            onBlur={handleBlur}
                            value={{ value: values.job_band, label: values.job_band }}
                            options={JOB_BANDS}
                        />
                      </Col>}
                    </Row>
                    {employeeCoInvest && <Row>
                      <Col>
                        <FormSelectorFieldRow
                            label="Department"
                            name="darpartment"
                            placeholder="Select"
                            onChange={(value: any) => {
                              setFieldValue("department", value.value);
                            }}
                            onBlur={handleBlur}
                            value={getDepartmentOption(values.department)}
                            options={DEPARTMENTS}
                        />
                      </Col>
                    </Row>}
                    <Row className="mt-2">
                      <Col>
                        <FormSelectorFieldRow
                            label="Eligibility"
                            name="eligibility_decision"
                            placeholder="Select"
                            onChange={(value: any) =>
                                setFieldValue("eligibility_decision", value)
                            }
                            onBlur={handleBlur}
                            value={{
                              value: get(values, "eligibility_type"),
                              label: get(values, "eligibility_type"),
                            }}
                            options={[
                              {
                                value: get(values, "eligibility_type"),
                                label: get(values, "eligibility_type"),
                              },
                            ]}
                            isDisabled={true}
                        />
                      </Col>
                    </Row>
                  {!showCommitmentFlow && <>
                    <Row className="mt-2">
                      <Col>
                        <RadioField
                            label="Requested Leverage"
                            name="requested_leverage"
                            className="leverage-radio"
                            disabled={true}
                            onChange={(value: any) =>
                                setFieldValue("requested_leverage", value)
                            }
                            options={getLeverageOptions()}
                            value={get(values, "requested_leverage")}
                            vertical
                        />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <RadioField
                            label="Max Leverage"
                            name="max_leverage"
                            className="leverage-radio"
                            onChange={(value: any) =>{
                                setFieldValue("max_leverage_ratio", value)
                                const isNoLimit = value.value === '-1'
                                const newLeverageOptions = getLeverageOptions(getMaxLevRatioInt(value))
                                const isFinalLeverageValid = newLeverageOptions.map(opt=>opt.value).includes(get(values, "final_leverage_ratio.value"))
                                if(!isFinalLeverageValid && !isNoLimit){
                                  const finalLeverage = newLeverageOptions[newLeverageOptions.length-1]
                                  setFieldValue("final_leverage_ratio", finalLeverage)
                                }
                            }}
                            options={getLeverageRatios()}
                            value={get(values, "max_leverage_ratio")}
                            vertical
                        />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <RadioField
                            label="Final Leverage"
                            name="final_leverage_ratio"
                            className="leverage-radio"
                            onChange={(value: any) => {
                              setFieldValue("final_leverage_ratio", value)
                            }}
                            options={getLeverageOptions(get(values, "max_leverage_ratio")?.value === '-1' ? null : getMaxLevRatioInt(get(values, "max_leverage_ratio")), true)}
                            value={get(values, "final_leverage_ratio")}
                            vertical
                        />
                      </Col>
                    </Row>
                    </>}
                    <Row className="mt-2">
                      <Col md="6">
                        <CurrencyField
                            label={showCommitmentFlow? "Final Cash Investment" : "Final Equity"}
                            name="final_entity"
                            placeholder={showCommitmentFlow? "Final Cash Investment" : "Final Equity"}
                            onChange={(value: any) =>
                                setFieldValue("final_entity", value)
                            }
                            onBlur={handleBlur}
                            // value={finalEntity ? finalEntity : 0}
                            value={finalEntity}
                            currencySymbol={get(fundDetails, 'currency.symbol')}
                        />
                        {get(errors, "final_amount") && (
                            <p className="text-danger mb-0">
                              {get(errors, "final_amount")}
                            </p>
                        )}
                      </Col>
                      <Col md="6">
                      {showCommitmentFlow ?
                      offerLeverage &&
                      <CurrencyField
                      label="Final Leverage Amount"
                      name="final_leverage"
                      placeholder="Enter Final Leverage"
                      onChange={(value: any) =>
                          setFieldValue("final_leverage", value)
                      }
                      onBlur={handleBlur}
                      value={get(values,'final_leverage')}
                      currencySymbol={get(fundDetails, 'currency.symbol')}
                  />
                    :
                        <CurrencyField
                            label="Final Leverage Amount"
                            name="final_leverage_amount"
                            placeholder="Leverage Amount"
                            onChange={(value: any) =>
                                setFieldValue("final_leverage_amount", value)
                            }
                            disabled={!data.has_custom_leverage}
                            onBlur={handleBlur}
                            value={(data.has_custom_leverage || hasMaxLeveredAmount) ? get(values, 'final_leverage_amount') : getFinalLeverage(values)}
                            currencySymbol={get(fundDetails, 'currency.symbol')}
                        />}
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col md="6">
                        <CurrencyField
                            label={showCommitmentFlow ? "Cash Investment" : "Requested Equity"}
                            name="requested_entity"
                            placeholder="Enter Requested Equity"
                            disabled={true}
                            onChange={(value: any) =>
                                setFieldValue("requested_entitys", value)
                            }
                            onBlur={handleBlur}
                            value={Number(get(values, "requested_entity", 0))}
                            currencySymbol={get(fundDetails, 'currency.symbol')}
                        />
                      </Col>

                      <Col md="6">
                        {offerCashlessCommitment && <CurrencyField
                            label={showCommitmentFlow? "Management Fee Offset" : "Cashless Commitment"}
                            name="cashless_commitment"
                            placeholder={showCommitmentFlow? "Management Fee Offset" : "Cashless Commitment"}
                            onChange={(value: any) =>null
                              // setFieldValue("cashless_commitment", value)
                          }
                          disabled={true}
                            onBlur={() => {}}
                            value={get(values, 'cashless_commitment')}
                            currencySymbol={get(fundDetails, 'currency.symbol')}
                        />}
                      </Col>
                    </Row>
                    <Row className="mt-2">
                    <Col md="6">
                        <CurrencyField
                            label={showCommitmentFlow ? "Finalized Gross Investment" : "Total Investment"}
                            name="final_total_investment"
                            placeholder={showCommitmentFlow ? "Enter Finalized Gross Investment" : "Enter Total Investment"}
                            disabled={!data.has_custom_total_investment}
                            onChange={(value: any) =>
                                setFieldValue("final_total_investment", value)
                            }
                            onBlur={handleBlur}
                            value={(data.has_custom_total_investment || hasMaxLeveredAmount) ? get(values, 'final_total_investment') : getTotalInvestment(values)}
                            currencySymbol={get(fundDetails, 'currency.symbol')}
                        />
                      </Col>
                      <Col md="6">
                      {showCommitmentFlow && offerLeverage &&
                        <FormTextFieldRow
                            label="Max Leverage Percentage (%)"
                            name="max_leverage_percentage"
                            placeholder=""
                            onChange={(e: any) =>
                              setFieldValue("max_leverage_percentage", e.target.value)
                          }
                            onBlur={handleBlur}
                            value={values.max_leverage_percentage}
                            readOnly={false}
                        />}
                      </Col>
                    </Row>
                    <Row className="mt-2">
                    {offerCashlessCommitment &&
                    <Col md="6">
                         <CurrencyField
                            label={showCommitmentFlow? "Final Management Fee Offset" : "Final Cashless Commitment"}
                            name="final_cashless_commitment"
                            placeholder={showCommitmentFlow? "Final Management Fee Offset" : "Final Cashless Commitment"}
                            onChange={(value: any) =>
                              setFieldValue("final_cashless_commitment", value)
                          }
                            onBlur={() => {}}
                            value={get(values, 'final_cashless_commitment')}
                            currencySymbol={get(fundDetails, 'currency.symbol')}
                        />
                      </Col>}
                      {showCommitmentFlow &&
                      offerLeverage &&
                      <Col md="6">
                      <CurrencyField
                      label="Leverage Amount"
                      name="leverage_amount"
                      placeholder=""
                      onChange={(value: any) => null}
                      disabled={true}
                      onBlur={handleBlur}
                      value={get(values,'leverage_amount')}
                      currencySymbol={get(fundDetails, 'currency.symbol')}
                    />
                      </Col>}

                    </Row>
                    {showCommitmentFlow &&
                    <Row>
                      <Col  md="6">
                      <CurrencyField
                      label="Gross Investment"
                      name="gross_investment"
                      placeholder=""
                      onChange={(value: any) => null}
                      disabled={true}
                      onBlur={handleBlur}
                      value={get(values,'gross_investment')}
                      currencySymbol={get(fundDetails, 'currency.symbol')}
                    />
                      </Col>
                    </Row>}
                  {!showCommitmentFlow && hasMaxLeveredAmount &&
                    <Row className="mt-2">
                    <Col md="6">
                        <CurrencyField
                            label="Max Levered Amount"
                            name="requested_entity"
                            placeholder="Enter Max Levered Amount"
                            onChange={(value: any) =>
                                setFieldValue("application_max_levered_amount", value)
                            }
                            onBlur={handleBlur}
                            value={Number(get(values, "application_max_levered_amount", 0))}
                            currencySymbol={get(fundDetails, 'currency.symbol')}
                        />
                      </Col>
                    </Row>}

                    <Row className="mt-3">
                      {
                        !hasPreDocumentStage && <EditApplicantStatusCol>
                        <ApplicantPill
                            label="Eligibility Decision"
                            data={values}
                            field="eligibility_decision"
                        />
                      </EditApplicantStatusCol>
                      }
                      <EditApplicantStatusCol>
                        <ApplicantPill
                            label="KYC/AML"
                            data={values}
                            field="kyc_aml"
                        />
                      </EditApplicantStatusCol>
                      {!hasPreDocumentStage && <EditApplicantStatusCol>
                        <ApplicantPill
                            label="Application Approval"
                            data={values}
                            field="application_approval"
                        />
                      </EditApplicantStatusCol>}
                      {!skipTax && !hasPreDocumentStage && <EditApplicantStatusCol>
                        <ApplicantPill
                            label="Tax Review"
                            data={values}
                            field="taxReview"
                        />
                      </EditApplicantStatusCol>}
                      {hasPreDocumentStage && <EditApplicantStatusCol>
                        <ApplicantPill
                          label="Application Approval"
                          data={values}
                          field="pre_document_stage"
                        />
                      </EditApplicantStatusCol>}
                      {fundDetails?.enable_internal_tax_flow && <EditApplicantStatusCol>
                        <ApplicantPill
                            label="Internal Tax"
                            data={values}
                            field="internal_tax"
                        />
                      </EditApplicantStatusCol>}
                      <EditApplicantStatusCol>
                        <ApplicantPill
                            label="Final Review"
                            data={values}
                            field="legalDocs"
                        />
                      </EditApplicantStatusCol>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <FormSelectorFieldRow
                            label="Vehicle"
                            name="vehicle"
                            placeholder="Select"
                            onChange={(value: any) => {
                              setFieldValue("vehicle", value.value);
                              setFieldValue("share_class", null);
                            }}
                            onBlur={handleBlur}
                            value={getOptionById(vehicleOptions, values.vehicle)}
                            options={vehicleOptions}
                        />
                      </Col>
                      <Col>
                        {Boolean(values.vehicle) && (
                            <FormSelectorFieldRow
                                label="Share Class"
                                name="share_class"
                                placeholder="Select"
                                onChange={(value: any) => {
                                  setFieldValue("share_class", value.value);
                                }}
                                onBlur={handleBlur}
                                value={
                                  values.share_class
                                      ? getOptionById(
                                          getShareClassOptions(values.vehicle as number),
                                          values.share_class
                                      )
                                      : null
                                }
                                options={getShareClassOptions(values.vehicle as number)}
                            />
                        )}
                      </Col>
                    </Row>
                    {employeeCoInvest && <Row className="mt-2">
                      <Col>
                        <FormTextFieldRow
                            label="Restricted Geographic Area"
                            name="restricted_geographic_area"
                            placeholder="Enter Restricted Geographics Area"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={get(values, 'restricted_geographic_area')}
                        />
                      </Col>
                      <Col>
                        <FormTextFieldRow
                            label="Restricted Time Period"
                            name="restricted_time_period"
                            placeholder="Enter Restricted Time Period"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={get(values, 'restricted_time_period')}
                        />
                      </Col>
                    </Row>}
                    <Row className="mt-2">
                      <FormTextFieldRow
                          label="Investor Account Code"
                          name="investor_account_code"
                          placeholder="Enter Investor Account Code"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={get(values, 'investor_account_code')}
                      />
                    </Row>
                    {
                        data.transfers && <>
                          <Row className="mt-2">
                            <Col md={6}>
                              <FormDateField
                                  name="loan_date"
                                  label="Transfer Loan Date"
                                  placeholder="Enter Transfer Loan Date"
                                  value={get(values, 'loan_date') ? get(values, 'loan_date') : new Date()}
                                  onChange={(e: any) => setFieldValue('loan_date', new Date(e))}
                                  onBlur={handleBlur}
                              />
                            </Col>
                            <Col md={6}>
                              <CurrencyField
                                  label="Transfer Loan Balance"
                                  name="loan_balance"
                                  placeholder="Enter Transfer Loan Balance"
                                  onChange={(value: any) =>
                                      setFieldValue("loan_balance", value)
                                  }
                                  onBlur={handleBlur}
                                  value={get(values, 'loan_balance') ? get(values, 'loan_balance') : 0}
                                  currencySymbol={get(fundDetails, 'currency.symbol')}
                              />
                            </Col>
                          </Row>
                          <Row className="mt-2">
                            <Col md={6}>
                              <FormDateField
                                  name="interest_date"
                                  label="Accrued Interest Date"
                                  placeholder="Enter Accrued Interest Date"
                                  value={get(values, 'interest_date') ? get(values, 'interest_date') : new Date()}
                                  onChange={(e: any) => setFieldValue('interest_date', new Date(e))}
                                  onBlur={handleBlur}
                              />
                            </Col>
                            <Col md={6}>
                              <CurrencyField
                                  label="Accrued Interest Balance"
                                  name="interest_balance"
                                  placeholder="Enter Accrued Interest Balance"
                                  onChange={(value: any) =>
                                      setFieldValue("interest_balance", value)
                                  }
                                  onBlur={handleBlur}
                                  value={get(values, 'interest_balance') ? get(values, 'interest_balance') : 0}
                                  currencySymbol={get(fundDetails, 'currency.symbol')}
                              />
                            </Col>
                          </Row>
                        </>
                    }
                    <Row className="mt-2">
                      <Col>
                        <FormTextAreaRow
                            label="Add internal comment"
                            name="internal_comment"
                            placeholder="Enter Add internal comment"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={get(values, "internal_comment")}
                        />
                      </Col>
                    </Row>
                  </EditApplicantWrapper>
                  <EditApplicantFooter>
                    <Row>
                      <Col md="3">
                        <PaginationIcon
                            className={!handlePrev ? "disabled" : ""}
                            onClick={handlePrev || (() => {})}
                        >
                          <ChevronLeft />
                        </PaginationIcon>

                    {(handlePrev || handleNext) && paginationFooter}

                        <PaginationIcon
                            className={!handleNext ? "disabled" : ""}
                            onClick={handleNext || (() => {})}
                        >
                          <ChevronRight />
                        </PaginationIcon>
                      </Col>
                      <Col>
                        <ButtonWrapper>
                          {handleFullApplication && (
                              <Button
                                  variant="outline-primary"
                                  onClick={handleFullApplication}
                              >
                                View full application
                              </Button>
                          )}
                          <Button variant="outline-primary" onClick={handleClose}>
                            Close
                          </Button>
                          <Button
                              type="button"
                              disabled={isSubmitting || !isValid}
                              onClick={() => handleSave(values, handleSubmit)}
                          >
                            Save
                          </Button>
                        </ButtonWrapper>
                      </Col>
                    </Row>
                  </EditApplicantFooter>
                  <NotificationModal
                      isShow={isShowNotificationModal}
                      comment={comment}
                      onChange={(val) => setComment(val)}
                      onSubmit={() => {
                        setIshowNotificationModal(false)
                        handleSubmit()
                      }}
                      onHide={handleClose}
                  />
                </>
            );
          }}

        </Formik>
      </>
  );
};

export default memo(EditApplicant);
