import React, {FunctionComponent} from 'react';
import {CardGroup} from "react-bootstrap";
import {IFundInvestorDetail, IOwnershipConfig} from "../../../../interfaces/fundInvestorDetail";
import StatCard from "./StatCard";
import {IInvestmentStat} from "../../../../interfaces/PageConfigs/investmentDashboard";
import {getDisplayValue} from "../../../../utils/RenderTablesDynamically";


interface StatCardProps {
  totalRow: IFundInvestorDetail,
  ownershipConfig: IOwnershipConfig
}

const StatCardGroup: FunctionComponent<StatCardProps> = ({totalRow, ownershipConfig}) => {
  const filterTiles = (tiles: IInvestmentStat[]) => {
    return tiles.filter(tile => tile.enabled)
  }

  if (!ownershipConfig) return <></>

  return <>
    <CardGroup>
      {filterTiles(ownershipConfig.tiles).filter((cardInfo: IInvestmentStat) => cardInfo.tile_type !== 'valuation').map((cardInfo: IInvestmentStat) => {
          const value = getDisplayValue(totalRow, cardInfo)
          return <StatCard
            heading={cardInfo.heading}
            value={value}
            glossaryHeading={cardInfo.tooltip?.heading}
            glossaryValue={cardInfo.tooltip?.description}
          />
        }
      )}
    </CardGroup>
    <CardGroup>
      {filterTiles(ownershipConfig.tiles).filter((cardInfo: IInvestmentStat) => cardInfo.tile_type === 'valuation').map((cardInfo: IInvestmentStat) => {
          const value = getDisplayValue(totalRow, cardInfo)
          return <StatCard
            heading={cardInfo.heading}
            value={value}
            glossaryHeading={cardInfo.tooltip?.heading}
            glossaryValue={cardInfo.tooltip?.description}
          />
        }
      )}
    </CardGroup>

  </>

};

export default StatCardGroup;
