import { Col, Row } from "react-bootstrap";
import { FormSelectorFieldRow } from "../../../../../../../../../../components/Form/SelectorField";
import { FormTextFieldRow } from "../../../../../../../../../../components/Form/TextField";
import { useEffect, useMemo, useState } from "react";
import API from "../../../../../../../../../../api/backendApi";
import CheckboxSelector from "../../../../../../../../../../components/Form/CheckboxSelector";
import get from "lodash/get";
import FilePreviewModal from "../../../../../../../../../../components/FilePreviewModal";
import { isEmpty, map } from "lodash";
import {GappedCol, StyledTitle} from "./styles"
import AddSubpools from "./components/AddSubpools";
import { useFetchInvestmentTrancheQuery } from "../../../../../../../../../../api/rtkQuery/carryApi";
import FormDateField from "../../../../../../../../../../components/Form/DateField";

export const planFromScratch = {
  label: "+ Start from scratch",
  value: "scratch",
};



const CarryPlanStep = ({ state, handleChange, carryPlanOptions, errors, isCarrySubpoolsActive }: any) => {
  const [vestingSchedulesOptions, setVestingSchedulesOptions] = useState<any[]>(
    []
  );
  const [fundOptions, setFundOptions] = useState<any[]>([]);
  const [dealOptions, setDealOptions] = useState<any[]>([]);
  const [docOptions, setDocOptions] = useState<any[]>([]);

  const {data: investmentTranches} = useFetchInvestmentTrancheQuery(undefined)

  const trancheOptions = useMemo(() => {
    if(investmentTranches) {
      return investmentTranches.filter((tranche:any)=> !tranche.carry_plan_id || tranche.carry_plan_id===state.carryPlanId).map((tranche: any) => ({
        label: tranche.name,
        value: tranche.external_id,
        is_tranche: true
      }))
    }
    return []
  }, [investmentTranches])

  const handleFetchVestingSchedule = async () => {
    const res = await API.fetchVestingSchedule();
    if (res.success) {
      const schedules = res.data?.map((schedule: any) => ({
        label: schedule.name,
        value: schedule.id,
      }));
      setVestingSchedulesOptions(schedules);
    }
  };

  const handleFetchFundsList = async () => {
    const res = await API.fetchCarryFundsList();
    if (res.success) {
      const funds = res.data?.filter((fund:any)=> !fund.carry_plan_id || fund.carry_plan_id===state.carryPlanId).map((fund: any) => ({
        label: fund.name,
        value: fund.external_id,
        is_deal: false
      }));
      setFundOptions(funds);
    }
  };

  const handleFetchDealsList = async () => {
    const res = await API.fetchAllDeals();
    if (res.success) {
      const deals = res.data?.filter((deal:any)=>!deal.carry_plan_id || deal.carry_plan_id===state.carryPlanId).map((deal: any) => ({
        label: deal.name,
        value: deal.external_id,
        is_deal: true
      }));
      setDealOptions(deals);
    }
  };

  const handleFetchCarryDocuments = async () => {
    const res = await API.fetchCarryTemplateDocuments();
    if (res.success) {
      const docs = res.data?.map((doc: any) => ({
        label: `${doc.name} - ${doc.description}`,
        value: doc.id,
        file: doc.document
      }));

      setDocOptions(docs)
    }
  };

  useEffect(() => {
    handleFetchVestingSchedule();
    handleFetchFundsList();
    handleFetchDealsList();
    handleFetchCarryDocuments()
  }, []);

  useEffect(() => {
    // reset conditional fields
    if (!state?.starting_template?.value) {
      handleChange("default_vesting_schedule", undefined);
    }
  }, [state?.starting_template?.value]);

  return (
    <>
    <GappedCol lg={8}>
      <FormTextFieldRow
        label="Carry Plan Name"
        placeholder=""
        name="name"
        onChange={(e: any) => handleChange("name", e.target.value)}
        value={state.name}
      />
      {errors.name && <div className="text-danger">{errors.name}</div>}
      
      <CheckboxSelector
        label="Select fund(s) or deal(s) or tranche(s) to apply to this carry plan"
        options={[
          { label: "Funds", options: fundOptions },
          { label: "Deals", options: dealOptions },
          { label: "Tranche", options: trancheOptions },
        ]}
        selectedOptions={get(state, "funds_and_deals", [])}
        onChange={(value: any) =>
          handleChange("funds_and_deals", value)
        }
        name="funds_and_deals"
        noOptSelectedTxt="Select fund(s) or deal(s) or tranche(s)"
        enableSelectAll={false}
        enableSearch
      />
      

      <FormSelectorFieldRow
        label="Choose a carry plan starting point"
        helperText="Either start from scratch or copy an existing carry plan as a starting point"
        name="starting_template"
        placeholder="Select carry plan"
        onChange={(value: any) => handleChange("starting_template", value)}
        value={state.starting_template}
        options={[planFromScratch, ...carryPlanOptions]}
      />
      {errors.starting_template && (
        <div className="text-danger">{errors.starting_template}</div>
      )}

          <Row>
          {state?.starting_template?.value === "scratch" && (
            <Col md={12} xl={6}>
              <FormSelectorFieldRow
                label="Assign a default vesting schedule"
                name="default_vesting_schedule"
                placeholder="Select default vesting schedule"
                onChange={(value: any) =>
                  handleChange("default_vesting_schedule", value)
                }
                value={state.default_vesting_schedule}
                options={vestingSchedulesOptions}
              />
              {errors.default_vesting_schedule && (
                <div className="text-danger">
                  {errors.default_vesting_schedule}
                </div>
              )}
            </Col>
          )}
            <Col md={12} xl={6}>
              <FormDateField
                onChange={(value: any) =>
                  handleChange("effective_date", value)
                }
                value={state.effective_date
                  ? new Date(state.effective_date)
                  : null
                }
                label="Effective Date"
              />
              {errors.effective_date && (
                <div className="text-danger">{errors.effective_date}</div>
              )}
            </Col>
          </Row>

      </GappedCol>
      {isCarrySubpoolsActive &&
       (state?.sub_pools?.length>0 || !state.carryPlanId || (state.carryPlanId && state.allocations?.length===0)) &&

      <GappedCol>
      <AddSubpools 
        vestingSchedulesOptions={vestingSchedulesOptions} 
        setSubpools={(value:any)=>handleChange("sub_pools", value)}
        errorMess={errors?.sub_pools}
        subpools={state?.sub_pools}
        docOptions={docOptions}
      />
      </GappedCol>
       }
      <GappedCol lg={8} style={{paddingTop:"0px"}}>

      <CheckboxSelector
        label="Select template documents to apply to this carry plan"
        options={docOptions}
        selectedOptions={get(state, "selected_carry_template_docs", [])}
        onChange={(value: any) =>
          handleChange("selected_carry_template_docs", value)
        }
        name="selected_carry_template_docs"
        noOptSelectedTxt="Select template documents"
      />
      {!isEmpty(get(state, "selected_carry_template_docs")) && (
        <div style={{ marginTop: "12px" }}>
          <StyledTitle>Documents</StyledTitle>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {map(get(state, "selected_carry_template_docs"), (elem: any) => (
              <FilePreviewModal
                documentId={elem.file.document_id}
                documentName={elem.file.title}
              />
            ))}
          </div>
        </div>
      )}
    </GappedCol>
    </>
  );
};

export default CarryPlanStep;
