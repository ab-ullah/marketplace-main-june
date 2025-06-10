import React, {FunctionComponent, useState} from 'react';
import CreateMarketingPageButton from "../../MarketingPages/components/CreateMarketingPageModal";
import MarketingPagesTable from "../../MarketingPages/components/FundMarketingPagesTable";
import {IFundBaseInfo} from "../../../interfaces/fundDetails";
import {HeaderWithSearch} from '../../../components/Header'
import {ContentContainer} from '../styles'

interface IndicationOfInterestProps {
    fund: IFundBaseInfo
}

const IndicationOfInterest: FunctionComponent<IndicationOfInterestProps> = ({ fund }) => {
    const [filter, setFilter] = useState<string>("");
    return <ContentContainer>
        <HeaderWithSearch title="Indication of Interest" isSubtitle onSearch={setFilter} searchValue={filter} >
            <CreateMarketingPageButton fund={fund} />
        </HeaderWithSearch>
        <MarketingPagesTable fund={fund} filter={filter} />
    </ContentContainer>
}

export default IndicationOfInterest;