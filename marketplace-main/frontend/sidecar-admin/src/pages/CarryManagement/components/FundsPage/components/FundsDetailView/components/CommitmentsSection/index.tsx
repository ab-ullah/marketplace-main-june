import { Row } from "react-bootstrap";
import { SectionWrapper } from "../../../../../ParticipantsPage/components/ParticipantDetailView/components/OverviewSection/styles";
import InfoTileLayout, { ITileInfo } from "../../../../../InfoTileLayout";
import API from "../../../../../../../../api/backendApi"
import { useEffect, useState } from "react";
import get from "lodash/get";
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import { SOURCE_TYPE } from "../../../../../CommitmentsPage/components/CommitmentModal/components/CommitmentForm/constants";

interface ICommitmentsSectionProps {
    data: any;
    setData: (_data: any) => void;
}

const CommitmentsSection = ({
    data,
    setData,
}:ICommitmentsSectionProps) => {
    const [InfoTileData, setInfoTileData] = useState<ITileInfo[]>([])

    const handleFetchDetail = async () => {
        const res = await API.fetchCommitmentDetail(get(data,'external_id'), SOURCE_TYPE.FUND);
        if(res.success){
        const commitDetail = res.data;
        setData({ ...data, tableData: get(commitDetail, "participants") });
        setInfoTileData([
            {
              label: "Participants",
              value: get(commitDetail, "participants.length"),
            },
            {
              label: "Total Capital Commit",
              value: formatCurrencyWithTwoDecimals(
                get(commitDetail, "total_capital_commit_sum")
              ),
            },
            {
              label: "Cashless Commit",
              value: formatCurrencyWithTwoDecimals(
                get(commitDetail, "cashless_commit_sum")
              ),
            },
            {
              label: "Management Fee Offset",
              value: formatCurrencyWithTwoDecimals(
                get(commitDetail, "management_fee_offset_sum")
              ),
            },
            {
              label: "Salary Reduction",
              value: formatCurrencyWithTwoDecimals(
                get(commitDetail, "salary_reduction_sum")
              ),
            },
          ])}
    };


    useEffect(() => {
       if(data.external_id) handleFetchDetail();
    }, [data.external_id]);
    
    return (
        <SectionWrapper>
            <Row>
                <InfoTileLayout data={InfoTileData as ITileInfo[]} />
            </Row>
        </SectionWrapper>
    );
}
 
export default CommitmentsSection;