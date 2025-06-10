import BenefitsSummary from "./BenefitsSummary";
import SummaryCard from "./SummaryCard";
import { SummaryWrapper } from "./styles";

const SummaryBlock = ({info, totalBenefits}: any) => {
  const { salaryAndBonus, benefits, vestedUnvested, estimated_values_latest_date} = info;

  return (
    <SummaryWrapper>
    <SummaryCard title="Summary" data={salaryAndBonus} />
    <BenefitsSummary data={benefits} totalBenefits={totalBenefits}/>
    <SummaryCard data={vestedUnvested} estimated_values_latest_date={estimated_values_latest_date}/>
    </SummaryWrapper>
  );
};

export default SummaryBlock;
