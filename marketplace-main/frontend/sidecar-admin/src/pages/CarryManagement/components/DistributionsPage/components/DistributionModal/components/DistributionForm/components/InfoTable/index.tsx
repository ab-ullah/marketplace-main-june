import { getSumByProperty, isAllowedDecimal } from "../../../../../../../../../../utils/getValue";
import { Cont, Row, Text, LeftCol, RightCol } from "./styles";
import API from "../../../../../../../../../../api/backendApi";
import { FormSelectorFieldRow } from "../../../../../../../../../../components/Form/SelectorField";
import { useEffect, useMemo, useState } from "react";
import { Col } from "react-bootstrap";
import {
  generateDateTimeWithZeroTime,
  standardizeDate,
} from "../../../../../../../../../../utils/dateFormatting";
import CurrencyInput from "../../../../../../../../../../components/Form/CurrencyInput";
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../../../utils/currency";
import { toast } from "react-toastify";
import { DISTRIBUTION_ID_PARAM } from "../../../../../../../../constants";
import { SUB_TABS } from "../../constants";
import { decimalDivide, decimalMultiply } from "../../../../../../../../../../utils/decimal";
import { useFetchInvestmentTrancheQuery } from "../../../../../../../../../../api/rtkQuery/carryApi";
import ReactDatePickerComp from "../../../../../../../../../../components/ReactDatePickerComp";

const InfoTable = ({ state, setState }: { state: any; setState: any }) => {
  const {
    source,
    fund_or_deal_or_tranche,
    date,
    carry_plan_name,
    total_participants,
    amount,
    escrow,
    net_distribution,
    allocated_points,
    total_points,
    external_id,
    is_manual,
    tabName
  } = state;
  const searchParams = new URLSearchParams(window.location.search);
  const distId = searchParams.get(DISTRIBUTION_ID_PARAM);
  const [fundsAndDealsAndTranches, setFundsAndDealsAndTranches] = useState({ funds: [], deals: [], tranches: [] });
  const prefillReqSet = (fund_or_deal_or_tranche?.value || external_id) && date;

  const {data: investmentTranches} = useFetchInvestmentTrancheQuery(undefined)

  const trancheOptions = useMemo(() => {
    if(investmentTranches) {
      return investmentTranches.map((tranche: any) => ({
        label: tranche.name,
        value: tranche.external_id,
        is_deal: false,
        is_tranche: true
      }))
    }
    return []
  }, [investmentTranches])

  const handleFetchFundsAndDealsOptions = async () => {
    const fundsRes = await API.fetchCarryFundsList();
    const dealsRes = await API.fetchAllDeals();
    if (fundsRes.success && dealsRes.success) {
      const fundOptions = fundsRes.data
        ?.filter((fund: any) => fund.carry_plan_id)
        .map((fund: any) => ({
          label: fund.name,
          value: fund.external_id,
          is_deal: false,
        }));
      const dealOptions = dealsRes.data
        ?.map((deal: any) => ({
          label: deal.name,
          value: deal.external_id,
          is_deal: true,
        }));
      setFundsAndDealsAndTranches({ funds: fundOptions, deals: dealOptions, 'tranches': trancheOptions });
    }
  };

  const handlePrefillCarryDetailsForDistribution = async (_date:string) => {
    if(prefillReqSet){
    const res = await API.fetchCarryDetailsForDistribution({
      external_id: fund_or_deal_or_tranche?.value || external_id,
      distribution_date: generateDateTimeWithZeroTime(_date),
    });
    if (res.success) {
      setState((prev: any) => ({ ...prev, ...res.data, originalAllocations: res.data.allocations }));
    } else {
      toast.error(
        `${res.data.Error} please try a different date or fund `
      );
      setState({source, fund_or_deal_or_tranche, date, amount, external_id, is_manual, tabName});
    }}
  };

  const calculateEscrowPercentage = () => {
    if(tabName===SUB_TABS.MANUAL_DISTRIBUTE){
      return (decimalMultiply( decimalDivide(escrow,(amount ||1)),100).toFixed(2))
    }
    const allocatedDistribution =
      ((amount || 0) * (allocated_points || 0)) / (total_points||1);
    const escrowAmount = allocatedDistribution - (net_distribution || 0);
    return Math.abs((escrowAmount / (amount || 1)) * 100).toFixed(2);
  };

  useEffect(() => {
    if (!distId) handleFetchFundsAndDealsOptions();
  }, [trancheOptions]);

  useEffect(() => {
    if (!distId) handlePrefillCarryDetailsForDistribution(date);
  }, [fund_or_deal_or_tranche, date, distId]);

  return (
    <Cont>
      <Row>
        <LeftCol>
          <Text>Distribution Date</Text>
        </LeftCol>
        <RightCol>
          {distId ? (
            <Text color="#10AC84">{standardizeDate(date)}</Text>
          ) : (
            <Col>
              <ReactDatePickerComp
                onChange={(value: any) =>{
                  if(distId) handlePrefillCarryDetailsForDistribution(value);
                  setState((prev: any) => ({
                    ...prev,
                    date: value,
                  }));}
                }
                selected={date ? new Date(date) : null}
              />
            </Col>
           )}
        </RightCol>
      </Row>
      <Row>
        <LeftCol>
          <Text>Source</Text>
        </LeftCol>
        <RightCol>
          {distId ? (
            <Text> {fund_or_deal_or_tranche?.label || source}</Text>
          ) : (
            <Col>
              <FormSelectorFieldRow
                label=""
                name="fund_or_deal_or_tranche"
                placeholder=""
                onChange={(value: any) =>
                  setState((prev: any) => ({ ...prev, fund_or_deal_or_tranche: value }))
                }
                value={fund_or_deal_or_tranche}
                options={[
                  { label: "Funds", options: fundsAndDealsAndTranches.funds },
                  { label: "Deals", options: fundsAndDealsAndTranches.deals },
                  {label: "Investment Tranches", options: fundsAndDealsAndTranches.tranches}
                ]}
              />
            </Col>
          )}
        </RightCol>
      </Row>
      <Row>
        <LeftCol>
          <Text> Carry Plan</Text>
        </LeftCol>
        <RightCol>
          <Text> {carry_plan_name}</Text>
        </RightCol>
      </Row>
      <Row>
        <LeftCol>
          <Text>Participants</Text>
        </LeftCol>
        <RightCol>
          <Text color="#10AC84">{total_participants}</Text>
        </RightCol>
      </Row>

      <Row>
        <LeftCol>
          <Text>Gross Distribution</Text>
        </LeftCol>
        <RightCol>
          {tabName===SUB_TABS.AUTO_DISTRIBUTE ?
          <CurrencyInput
            name="amount"
            placeholder=""
            onChange={(name: any, value: any) => {
              setState((prev: any) => ({ ...prev, [name]: value }));
            }}
            value={amount}
            additionalProps={{isAllowed:(value:any)=> value?.value? isAllowedDecimal(value.value,11,2):true}}        
          />
        :
        <Text color="#10AC84">{getSumByProperty(state.allocations,"amount")}</Text>
        }
        </RightCol>
      </Row>
      <Row>
        <LeftCol>
          <Text>Escrow</Text>
        </LeftCol>
        <RightCol>
          <Text color="#10AC84">{calculateEscrowPercentage()} %</Text>
        </RightCol>
      </Row>
      <Row>
        <LeftCol>
          <Text>Net Participant Distribution</Text>
        </LeftCol>
        <RightCol>
          <Text color="#10AC84">
            {formatCurrencyWithTwoDecimals(net_distribution)}
          </Text>
        </RightCol>
      </Row>
    </Cont>
  );
};

export default InfoTable;
