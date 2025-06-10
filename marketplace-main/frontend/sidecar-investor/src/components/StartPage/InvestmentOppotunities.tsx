import React, {FunctionComponent} from "react";
import size from "lodash/size";
import RsuiteTable from "../../components/Table/RSuite";
import {IOpportunity} from "../../pages/Opportunities/interfaces";
import {getColumns} from "./utils";
import {StartPageSectionHeading} from "../../pages/StartPage/styles";
import { useCompanyPrefix } from "../../utils/hooks";
import NoDataText from "../NoDataText";

interface InvestmentOpportunitiesProps {
  isLoading: boolean;
  opportunities?: IOpportunity[];
  scrollRef?:((instance: HTMLHeadingElement | null) => void) | React.RefObject<HTMLHeadingElement> | null | undefined;
  textData:any
}

const InvestmentOppotunities: FunctionComponent<
  InvestmentOpportunitiesProps
> = ({ isLoading, opportunities, scrollRef, textData }) => {
  const {companyPrefix} =useCompanyPrefix()
  const {title, empty} = textData
  return (
    <>
      <StartPageSectionHeading ref={scrollRef}>{title}</StartPageSectionHeading>
      {size(opportunities) === 0 ? <NoDataText text={empty}/> : <div style={{ width: "100%" }}>
        <RsuiteTable
          height={size(opportunities) > 10 ? "500px" : ""}
          isLoading={isLoading}
          wordWrap={true}
          rowSelection={false}
          columns={getColumns(companyPrefix)}
          data={opportunities}
          emptyMessage={empty}
          align={'left'}
        />
      </div>}
    </>
  );
};

export default InvestmentOppotunities;
