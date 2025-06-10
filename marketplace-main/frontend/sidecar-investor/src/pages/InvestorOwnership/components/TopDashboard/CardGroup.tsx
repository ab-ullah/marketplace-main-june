import React, {FunctionComponent} from 'react';
import {CardGroup} from "react-bootstrap";
import {IFundInvestorDetail, IOwnershipConfig} from "../../../../interfaces/fundInvestorDetail";
import StatCard from "./StatCard";
import {IInvestmentStat} from "../../../../interfaces/PageConfigs/investmentDashboard";
import {getDisplayValue} from "../../../../utils/RenderTablesDynamically";
import get from "lodash/get";
import {getPercentValue} from "../../../../utils/dollarValue";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import {roundAndAdd} from "../InvestedFunds/computations";
import {NA_DEFAULT_VALUE} from "../../../../constants/defaultValues";
import { useAppSelector } from '../../../../app/hooks';
import { selectCurrency } from '../../selectors';


interface StatCardProps {
  totalRow: IFundInvestorDetail,
  ownershipConfig: IOwnershipConfig
}

const StatCardGroup: FunctionComponent<StatCardProps> = ({totalRow, ownershipConfig}) => {
  const selectedCurrency = useAppSelector(selectCurrency)
  const filterTiles = (tiles: IInvestmentStat[]) => {
    return tiles.filter(tile => tile.enabled)
  }

  if (!ownershipConfig) return <></>

  return <CardGroup>
    {filterTiles(ownershipConfig.tiles).map((cardInfo: IInvestmentStat) => {
        const value = getDisplayValue(totalRow, cardInfo, totalRow['currency_symbol'])
        return <StatCard
          heading={cardInfo.heading}
          value={value}
          glossaryHeading={cardInfo.tooltip?.heading}
          glossaryValue={cardInfo.tooltip?.description}
        />
      }
    )}

  </CardGroup>

};

export default StatCardGroup;
