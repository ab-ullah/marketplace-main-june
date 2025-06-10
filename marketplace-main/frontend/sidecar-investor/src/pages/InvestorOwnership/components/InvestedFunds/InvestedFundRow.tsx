import React, {FunctionComponent} from 'react';
import {IInvestmentComposition, IOwnershipFundInvestor} from "../../../../interfaces/investorOwnership";
import {TOTAL_ROW_ID} from "./computations";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import {useAppSelector} from "../../../../app/hooks";
import {selectShowUSD} from "../../selectors";
import classNames from "classnames";
import {FundDetailLink} from "../../../../presentational/Links";
import {useGetCompanyInfoQuery} from "../../../../api/rtkQuery/commonApi";
import styled from "styled-components";
import {getTableDataRow} from "../../../../utils/RenderTablesDynamically";
import {useGetOwnershipPageConfigQuery} from "../../../../api/rtkQuery/pageConfigsApi";
import { useCompanyPrefix } from '../../../../utils/hooks';


const LogoImg = styled.img`
  width: 80px;
  margin-right: 10px;
`

const FirstColSpan = styled.span`
  display: inline-flex;
`

interface InvestedFundRowProps {
  investedFund: IOwnershipFundInvestor,
  compositions?: IInvestmentComposition,
  isSubRow?: boolean,
}


const InvestedFundRow: FunctionComponent<InvestedFundRowProps> = ({
                                                                    investedFund,
                                                                    compositions,
                                                                    isSubRow,
                                                                  }) => {
  const [open, setOpen] = React.useState(false);
  const showUSD = useAppSelector(selectShowUSD);
  const {data: companyInfo} = useGetCompanyInfoQuery(investedFund.fund.external_id, {skip: !investedFund.fund.external_id});
  const {data: ownershipConfig} = useGetOwnershipPageConfigQuery()
  const {companyPrefix} =useCompanyPrefix()
  const isTotalRow = investedFund.id === TOTAL_ROW_ID;
  const currencySymbol = showUSD ? '$' : investedFund.currency.symbol;
  const currencyRate = showUSD ? investedFund.currency.rate : 1;
  const isLegacy = investedFund.fund.is_legacy;

  const fundId = investedFund.fund.id;
  const fundComposition = !isSubRow && compositions && compositions[fundId]
  const hasSubRows = !isSubRow && fundComposition && fundComposition.length > 1;
  let firstCell = <FundDetailLink
    to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${investedFund.fund.external_id}/detail`}>{investedFund.fund.name}
  </FundDetailLink> as any;
  if (isTotalRow) firstCell = '';
  if (isSubRow) firstCell = investedFund.investor_name;

  const collapseImage = <img src="/assets/images/collapse.svg" alt=""/>
  const expandImage = <img src="/assets/images/expand.svg" alt=""/>
  const columnsConfig = ownershipConfig.tables[0].rows
  const columns = getTableDataRow(
    columnsConfig,
    isLegacy,
    investedFund,
    currencySymbol,
    currencyRate,
    firstCell
  )
  return <>
    <tr key={`${investedFund.id}-row`} className={classNames({'result-row': isTotalRow, 'subRow': isSubRow})}>
      <td>{isTotalRow ? 'Total' : <FirstColSpan>
        {!isSubRow && companyInfo?.company_logo && <LogoImg src={companyInfo.company_logo} alt=""/>}{hasSubRows &&
        <span onClick={() => setOpen(!open)}>
          {open ? collapseImage : expandImage}
        </span>}
      </FirstColSpan>
      }</td>
      {columns.map((column: any) => {
        return <td>{column}</td>
      })}
    </tr>
    {!isSubRow && fundComposition && fundComposition.length > 1 && open && fundComposition.map((fundInvestment) =>
      <InvestedFundRow
        investedFund={fundInvestment}
        isSubRow={true}
      />)}

  </>
};

export default InvestedFundRow;
