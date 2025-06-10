import React, {FunctionComponent} from "react";
import BenefitsSummary from "./BenefitsSummary";
import SummaryCard from "./SummaryCard";
import {SummaryWrapper} from "./styles";


export interface InfoProps{
    salaryAndBonus: any
    benefits: any
    vestedUnvested: any
    estimatedValuesLatestDate: any
}

export interface SummaryBlockProps {
    info: InfoProps
    totalBenefits: any
}


const SummaryBlock: FunctionComponent<SummaryBlockProps> = ({info, totalBenefits}: SummaryBlockProps) => {
    const { salaryAndBonus, benefits, vestedUnvested, estimatedValuesLatestDate} = info;

    return (
        <SummaryWrapper>
            <SummaryCard title="Summary" data={salaryAndBonus} />
            <BenefitsSummary data={benefits} totalBenefits={totalBenefits}/>
            <SummaryCard data={vestedUnvested} estimated_values_latest_date={estimatedValuesLatestDate}/>
        </SummaryWrapper>
    );
};

export default SummaryBlock