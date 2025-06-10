import { map } from 'lodash';
import React from 'react';
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../../../utils/currency";
import { BlockTitle } from "../../styles";
import { Amount, Label, SplitInfoCont, TileCont } from "./styles";

const SummaryCard = ({title, data, estimated_values_latest_date}: any) => {
    return <div>
        {title && <BlockTitle>{title}</BlockTitle>}
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "30px",
        width: "100%",
      }}
    >
      {map(data,(dat: any) => (
        <TileCont>
          <Label>{dat.label}</Label>
          <Label>{estimated_values_latest_date}</Label>
          {dat.hasOwnProperty('amount') ? (
            <Amount>{formatCurrencyWithTwoDecimals(dat.amount)}</Amount>
          ) : (
            <SplitInfoCont>
              {dat.splitAmount.map((splitDat: any) => (
                <div>
                  <Amount>{Number(splitDat?.amount)?  formatCurrencyWithTwoDecimals(splitDat.amount): "-"}</Amount>
                  <Label>{splitDat.label}</Label>
                </div>
              ))}
            </SplitInfoCont>
          )}
        </TileCont>
      ))}
    </div>
  </div>
}

export default SummaryCard;