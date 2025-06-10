import { Value, SubText, Label, AdditionalInfo } from "../styled";


const AllocationStat = ({
    label,
    value,
    subtext,
    isBold,
    additionalInfo
}: any) => {
    return <div>
        <Value isBold={isBold}>{value}</Value>
        {subtext && <SubText>{subtext}</SubText>}
        {label && <Label>{label}</Label>}
        <AdditionalInfo>{additionalInfo ?? ''}</AdditionalInfo>
    </div>
}

export default AllocationStat;