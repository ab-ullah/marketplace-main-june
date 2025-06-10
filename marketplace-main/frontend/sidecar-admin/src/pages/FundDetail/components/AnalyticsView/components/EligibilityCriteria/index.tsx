import React, { FunctionComponent } from 'react'
import { EligibiliyCriteriaProps } from './interfaces'
import { TabContentContainer } from "../../styles";
import { HeaderWithButtons } from '../../../../../../components/Header'

const EligibilityCriteria: FunctionComponent<EligibiliyCriteriaProps> = ({ fund }) => {
    return <TabContentContainer>
        <HeaderWithButtons title='Eligibility criteria analytics' isSubtitle >
        </HeaderWithButtons>
    </TabContentContainer>
}

export default EligibilityCriteria