import API from "../../../../../../../../api"
import NavableLoader from "../../../../../../../../components/NavableLoader";
import {
    SectionWrapper
} from "../../../../../ParticipantsPage/components/ParticipantDetailView/components/OverviewSection/styles";
import { Row } from "react-bootstrap";
import {useEffect, useState} from "react";
import InfoTileLayout, {ITileInfo} from "../../../../../InfoTileLayout";
import {formatCurrencyWithTwoDecimals} from "../../../../../../../../utils/currency";
import {getSumByProperty} from "../../../../../../../../utils/getValue";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";

interface IInvestmentSection {
    data: any;
    setData: (_data: any) => void;
    fundId: string;
    goBack: () => void;
}

const DealsSection = ({
                             data,
                             setData,
                             fundId,
                             goBack
                         }: IInvestmentSection) => {
    const [InfoTileData, setInfoTileData] = useState<ITileInfo[]>([])

    const handleFetchDetail = async () => {
        const res = await API.fetchCarryFundDealsById(fundId);
        const tableData = res.data;
        setData({ ...data, tableData });
        setInfoTileData([
            { label: "Deals", value: tableData.length},
            { label: "Total Estimated Carry Value", 
                value:  formatCurrencyWithTwoDecimals(data.estimated_value),
                subTitle: data.estimated_value_date && `As of: ${standardizeDate(data.estimated_value_date)}`
            },
            { label: "Distributions", value:  formatCurrencyWithTwoDecimals(data.deal_distributions) },
        ])
    };


    useEffect(() => {
        handleFetchDetail();
    }, []);

    if (!data) return <NavableLoader />;
    return (
        <SectionWrapper>
            <Row>
                <InfoTileLayout data={InfoTileData as ITileInfo[]} />
            </Row>
        </SectionWrapper>
    );
};

export default DealsSection;
