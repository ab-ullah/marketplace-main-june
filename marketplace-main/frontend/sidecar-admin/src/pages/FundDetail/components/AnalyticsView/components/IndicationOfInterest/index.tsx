import React, { FunctionComponent, useEffect, useState } from "react";
import { initialAnalyticsData } from './constants';
import API from "../../../../../../api";
import { useParams } from "react-router-dom";
import { parseAnalyticsData } from './utils';
import { AnalyticsViewProps } from "./interfaces";
import { ChartReference } from '../CustomCharts/interfaces';
import { AnalyticsData, FundAnalytics } from '../../interfaces';
import { BarChartData } from '../../../../../../components/GraphBars/interfaces';
import { Charts, ChartReferences } from '../CustomCharts';
import { BarChart } from '../../../../../../components/GraphBars';
import { HeaderWithButtons } from '../../../../../../components/Header';
import { AnalyticsAndChartsContainer, AnalyticBlocksContainer, AnalyticsBlocksInner, AnalyticsBlock, AnalyticsBlockTitle, TabContentContainer, VerticalSection, ExportCSVButton, HelpIcon } from "../../styles";
import { BarChartContainer } from './styles'

const EligibilityCriteria: FunctionComponent<AnalyticsViewProps> = ({ fund }) => {
    const [analytics, setAnalytics] = useState<FundAnalytics>(initialAnalyticsData);
    const [totalInvestment, setTotalInvestment] = useState<string>('');
    const [referenceData, setReferenceData] = useState<ChartReference[]>([]);
    const [chartData, setChartData] = useState<AnalyticsData[]>([]);
    const [periodString, setPeriodString] = useState<string>('');
    const [barChartData, setBarChartData] = useState<BarChartData[]>([]);

    const { externalId } = useParams<{ externalId: string }>();


    useEffect(() => {
        const getAnalytics = async () => {
            const analytics = await API.getIndicationOfInterestAnalytics(externalId) as FundAnalytics;
            setAnalytics(analytics);
        }
        getAnalytics();
    }, [externalId])

    useEffect(() => {
        const parsed = parseAnalyticsData(analytics);
        setTotalInvestment(parsed.totalInvestment);
        setReferenceData(parsed.referenceData);
        setChartData(parsed.chartData);
        setPeriodString(parsed.periodString);
        setBarChartData(parsed.barChartData);
    }, [analytics])

    const exportCSV = async () => {
        const fileName = `${fund.name} IoI Analytics.csv`;
        await API.exportIndicationOfInterestAnalytics(externalId, fund.id, fileName);
    };

    return <TabContentContainer>
        <HeaderWithButtons title='Indication of interest analytics' isSubtitle >
            <ExportCSVButton onClick={exportCSV} />
        </HeaderWithButtons>
        {analytics && <AnalyticsAndChartsContainer>
            <Charts data={chartData} insideContent={{ title: totalInvestment, subtitle: 'Total investment' }} />
            <AnalyticBlocksContainer>
                <AnalyticsBlocksInner>
                    <AnalyticsBlock>
                        <AnalyticsBlockTitle>
                            <h1>{analytics.visited_fund_page}</h1>
                            <h4>Visited Fund Page  <HelpIcon /></h4>
                        </AnalyticsBlockTitle>
                    </AnalyticsBlock>
                    <AnalyticsBlock>
                        <AnalyticsBlockTitle>
                            <h1>{analytics.visited_interest_page}</h1>
                            <h4>Visited Questionnaire  <HelpIcon /></h4>
                        </AnalyticsBlockTitle>
                    </AnalyticsBlock>
                    <AnalyticsBlock>
                        <AnalyticsBlockTitle>
                            <h1>{100 * analytics.submitted_interest_form / analytics.visited_interest_page || 0}&#x25;</h1>
                            <h4>&#x25; Completed Questionnaire <HelpIcon /></h4>
                        </AnalyticsBlockTitle>
                    </AnalyticsBlock>
                    <AnalyticsBlock>
                        <AnalyticsBlockTitle>
                            <h3>{periodString}</h3>
                            <h4>Dates <HelpIcon /></h4>
                        </AnalyticsBlockTitle>
                    </AnalyticsBlock>
                </AnalyticsBlocksInner>
            </AnalyticBlocksContainer>
            <ChartReferences data={referenceData} />
        </AnalyticsAndChartsContainer>
        }
        {barChartData.length ?
            <VerticalSection>
                <h2>Details</h2>
                <BarChartContainer>
                    {barChartData.map(({ data, title }, index) => {
                        return <BarChart key={index} data={data} title={title} />
                    })}
                </BarChartContainer>
            </VerticalSection> : <></>}
    </TabContentContainer>
}

export default EligibilityCriteria;