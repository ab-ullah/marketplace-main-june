import { decimalSubtract } from "../../../../../../../../../../utils/decimal";
import { limitCarryDecimalPlaces } from "../../../../../../../../../../utils/getValue";
import { Cont, Row, Text, LeftCol, RightCol, PointsContainer} from "./styles";

const InfoTable = ({info}:{info:any}) => {
    const {name, fundsAndDealsName, defaultVestingScheduleName, totalPoints,participantsWithPoints,allocatedPoints} = info
    return ( <Cont>
         <Row>
            <LeftCol><Text> Name of Carry Plan</Text></LeftCol>
            <RightCol><Text> {name}</Text></RightCol>
        </Row>
        <Row>
            <LeftCol><Text> Source</Text></LeftCol>
            <RightCol><Text> {fundsAndDealsName}</Text></RightCol>
        </Row>
        <Row>
            <LeftCol><Text>Participants</Text></LeftCol>
            <RightCol><Text color='#10AC84'>{participantsWithPoints} participants with allocated points</Text></RightCol>
        </Row>
        <Row>
            <LeftCol><Text>Vesting Schedule</Text></LeftCol>
            <RightCol><Text>{defaultVestingScheduleName}</Text></RightCol>
        </Row>
        <Row>
            <LeftCol><Text>Total points</Text></LeftCol>
            <RightCol><Text>{limitCarryDecimalPlaces(totalPoints)}</Text>
            <PointsContainer>
                <div>
                <Text >Unallocated</Text>
                <Text color="#F5A61D">{limitCarryDecimalPlaces(decimalSubtract(totalPoints,allocatedPoints).toString())}</Text>
                </div>
                <div>
                <Text >Allocated</Text>
                <Text color="#10AC84">{limitCarryDecimalPlaces(allocatedPoints)}</Text>
                </div>
            </PointsContainer>  
            </RightCol>
        </Row>
    </Cont> );
}
 
export default InfoTable;