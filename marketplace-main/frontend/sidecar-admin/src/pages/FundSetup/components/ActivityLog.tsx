import React, { FunctionComponent, useState } from 'react';
import { IFundBaseInfo } from "../../../interfaces/fundDetails";
import { HeaderWithSearch } from '../../../components/Header'
import { ContentContainer } from '../styles'

interface ActiviyLogProps {
    fund: IFundBaseInfo
}

const ActivityLog: FunctionComponent<ActiviyLogProps> = ({ fund }) => {
    const [filter, setFilter] = useState<string>("");
    return <ContentContainer>
        <HeaderWithSearch title="Activity Log" isSubtitle onSearch={setFilter} searchValue={filter} >
        </HeaderWithSearch>
    </ContentContainer>
}

export default ActivityLog;