import React, {FunctionComponent} from 'react'
import {AnalyticsViewProps} from './interfaces'
// import IndicationOfInterest from './components/IndicationOfInterest'
import {AnalyticsContainer, Tab, TabsContainer} from './styles'
import ExportIndicationOfInterests from "./components/IndicationOfInterest/ExportView";

const AnalyticsView: FunctionComponent<AnalyticsViewProps> = ({ fund }) => {
    return <AnalyticsContainer>
        <TabsContainer>
            <Tab eventKey="indicationOfInterest" title="Indication of interest" className="create-form-tab">
                <ExportIndicationOfInterests/>
            </Tab>
            {/*<Tab eventKey="eligibilityCriteria" title="Eligibility criteria" className="create-form-tab">*/}
            {/*    <EligibilityCriteria fund={fund} />*/}
            {/*    <Container className="px-0 mt-4">*/}
            {/*        <Row>*/}
            {/*            <Col><h3>Coming soon!</h3></Col>*/}
            {/*        </Row>*/}
            {/*    </Container>*/}
            {/*</Tab>*/}
        </TabsContainer>
    </AnalyticsContainer>
}

export default AnalyticsView;