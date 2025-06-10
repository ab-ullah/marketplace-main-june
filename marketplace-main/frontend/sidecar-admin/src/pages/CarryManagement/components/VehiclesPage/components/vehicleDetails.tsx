import RsuiteTable from '../../../../../components/Table/RSuite';
import { Body, Header, HeaderTitle } from "../../StatsTable/styles"
import { HeaderWrapper, StyledButton } from "./styles";
import { LeftIndentRsuite } from "../../ShareClasses/styled";
import { VEHICLE_TABLE_COLUMNS } from '../constants';

const VehicleDetails = ({vehicle, onAddShareClasses}: any) => {
    return <>
    <Header>
        <HeaderTitle>Overview</HeaderTitle>
    </Header>
    <Body>
        <HeaderWrapper>
        <div>
        <h4>Share Classes</h4>
        <p>Open share classes to edit default rules</p>
        </div>
       <StyledButton onClick={onAddShareClasses} variant="outline-primary">
        Edit
        </StyledButton>
        </HeaderWrapper>
        <LeftIndentRsuite className='mt-5'>
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={VEHICLE_TABLE_COLUMNS}
          data={vehicle.classes}
          wordWrap={true}
          rowHeight={50}
          rowBordered
        />
        </LeftIndentRsuite>
    </Body>
    </>
}

export default VehicleDetails;