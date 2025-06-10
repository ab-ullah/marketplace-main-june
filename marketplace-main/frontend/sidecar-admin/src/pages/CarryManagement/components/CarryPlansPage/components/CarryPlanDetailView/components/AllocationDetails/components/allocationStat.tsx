import TooltipPopover from "../../../../../../../../../components/TooltipPopover";
import { Value, SubText, Label, Description, InfoWrapper, AdditionalInfo } from "./styles";


const AllocationStat = ({
    label,
    value,
    subtext,
    isBold,
    tooltip,
    additionalInfo
}: any) => {
    return <div>
        <Value isBold={isBold}>{value}</Value>
        {subtext && <SubText>{subtext}</SubText>}
        <InfoWrapper>
        {label && <Label>{label}</Label>}
        {tooltip && <TooltipPopover tooltip={tooltip} />}
        </InfoWrapper>
        <AdditionalInfo>{additionalInfo ?? ''}</AdditionalInfo>
    </div>
}

export default AllocationStat;