import { limitCarryDecimalPlaces } from "../../../../../../../../../utils/getValue";
import AllocationStat from "./allocationStat";
import { AllocationCardStatWrapper, CardTopContentWrapper, MultiStatWrapper, VerticalDivider } from "./styles";

const AllocationPointsCard = ({ allocationDetail }: any) => {
    const { bps, vested_bps, un_vested_bps } = allocationDetail;
    return <AllocationCardStatWrapper>
        <CardTopContentWrapper>
        <AllocationStat isBold label="Total Points" value={limitCarryDecimalPlaces(bps)}/>
        <AllocationStat label="% Vested" value={limitCarryDecimalPlaces(allocationDetail.percentage_vested)} isBold />
        </CardTopContentWrapper>
        <hr />
        <MultiStatWrapper>
        <AllocationStat label="Points" subtext="Vested" value={limitCarryDecimalPlaces(vested_bps)}/>
        <VerticalDivider />
        <AllocationStat subtext="Unvested" value={limitCarryDecimalPlaces(un_vested_bps)}/>
        </MultiStatWrapper>
    </AllocationCardStatWrapper>
}

export default AllocationPointsCard;