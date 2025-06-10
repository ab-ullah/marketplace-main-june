import API from "../../../../../../../../api"
import NavableLoader from "../../../../../../../../components/NavableLoader";
import {
    SectionWrapper
} from "../../../../../ParticipantsPage/components/ParticipantDetailView/components/OverviewSection/styles";
import { Row } from "react-bootstrap";
import {useEffect, useState} from "react";
import InfoTileLayout, {ITileInfo} from "../../../../../InfoTileLayout";
import {handleFormatToCurrency} from "../../../../../../../../utils/currency";
import {get, isEmpty} from "lodash";
import { useGetCarryPlansConfigQuery } from "../../../../../../../../api/rtkQuery/companyApi";
import { getTooltip } from "../../../FundsListView/constants";
import { CARRY_VALUE_LABEL } from "../../../../../../constants";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";

interface IOverviewSection {
    data: any;
    setData: (_data: any) => void;
    fundId: string;
    goBack: () => void;
}

const OverviewSection = ({
                             data,
                             setData,
                             fundId,
                             goBack
                         }: IOverviewSection) => {
    const [InfoTileData, setInfoTileData] = useState<ITileInfo[]>([] as ITileInfo[]);
    const {data: carryConfig} = useGetCarryPlansConfigQuery()

    const handleFetchDetail = async () => {
        const res = await API.fetchCarryFundAllocationsById(fundId);
        const tableData = res.data
        setData({ ...data, tableData });
    };


    useEffect(() => {
        handleFetchDetail();
    }, [JSON.stringify(data)]);

    useEffect(()=>{
    if(!isEmpty(data)){
    setInfoTileData([
        { label: "Fund Size", value:  handleFormatToCurrency(parseInt(get(data, "target_fund_size")))},
        { label: CARRY_VALUE_LABEL.estimated_value, 
            value:  handleFormatToCurrency(parseInt(get(data, "estimated_value"))), 
            tooltip: getTooltip('estimated_value', carryConfig?.tooltips ?? [])?.tooltip,
            subTitle: data.estimated_value_date && `As of ${standardizeDate(data.estimated_value_date)}`
        },
        { label: CARRY_VALUE_LABEL.fair_market_value, value:  handleFormatToCurrency(parseInt(get(data, "fair_market_value"))), 
            tooltip: getTooltip('fair_market_value', carryConfig?.tooltips ?? [])?.tooltip,
            subTitle: data.fair_market_value_date && `As of ${standardizeDate(data.fair_market_value_date)}`
        },
        { label: "Distributions", value:  handleFormatToCurrency(parseInt(get(data, "total_distributions")))}
    ]);
}
else{
    setInfoTileData([])
}
    },[data])

    if (!data) return <NavableLoader />;
    return (
        <SectionWrapper>
            <Row>
                <InfoTileLayout data={InfoTileData as ITileInfo[]} colProps={{lg: 3}}/>
            </Row>
        </SectionWrapper>
    );
};

export default OverviewSection;
