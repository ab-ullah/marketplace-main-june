import { Row } from "react-bootstrap";
import { SectionWrapper } from "../../../../../ParticipantsPage/components/ParticipantDetailView/components/OverviewSection/styles";
import InfoTileLayout, { ITileInfo } from "../../../../../InfoTileLayout";
import { useEffect, useState } from "react";
import get from "lodash/get";
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import { isEmpty } from "lodash";

interface ICommitmentsSectionProps {
  data: any;
}

const CommitmentsSection = ({ data }: ICommitmentsSectionProps) => {
  const [InfoTileData, setInfoTileData] = useState<ITileInfo[]>([]);

  useEffect(() => {
    if(!isEmpty(data)){
    setInfoTileData([
      {
        label: "Participants",
        value: get(data, "participants.length"),
      },
      {
        label: "Total Capital Commit",
        value: formatCurrencyWithTwoDecimals(
          get(data, "total_capital_commit_sum")
        ),
      },
      {
        label: "Cashless Commit",
        value: formatCurrencyWithTwoDecimals(get(data, "cashless_commit_sum")),
      },
      {
        label: "Management Fee Offset",
        value: formatCurrencyWithTwoDecimals(
          get(data, "management_fee_offset_sum")
        ),
      },
      {
        label: "Salary Reduction",
        value: formatCurrencyWithTwoDecimals(get(data, "salary_reduction_sum")),
      },
    ]);}
  }, [data]);

  return (
    <SectionWrapper>
      <Row>
        <InfoTileLayout data={InfoTileData as ITileInfo[]} />
      </Row>
    </SectionWrapper>
  );
};

export default CommitmentsSection;
