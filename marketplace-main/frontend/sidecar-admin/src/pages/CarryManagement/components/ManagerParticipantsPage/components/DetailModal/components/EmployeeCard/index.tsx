import get from "lodash/get";
import { StatCardWrapper, VerticalDivider, HorizontalDivider } from "../styles";
import { EmployeeName, Label, Value } from "./styles";
import { standardizeDate } from "../../../../../../../../utils/dateFormatting";

const EmployeeCard = ({data}:any) => {
    return ( <StatCardWrapper>
        <div>
            <EmployeeName>{get(data,'first_name','-')} {get(data,'last_name')}</EmployeeName>
            <Value>{get(data,'employee_id','-')}</Value>
            <Label>Employee ID</Label>
        </div>
        <HorizontalDivider/>
        <div className="d-flex justify-content-between">
            <div>
            <Value>{get(data,'current_position_title','-')}</Value>
            <Label>Title</Label>
            </div>
            <VerticalDivider/>
            <div>
            <Value>{get(data,'department','-')}</Value>
            <Label>Department</Label>
            </div>
            <VerticalDivider/>
            <div>
            <Value>{get(data,'job_band','-')}</Value>
            <Label>Job Band</Label>
            </div>
            <VerticalDivider/>
            <div>
            <Value>{ get(data,'hire_date') ? standardizeDate(get(data,'hire_date')) : "-"}</Value>
            <Label>Hire Date</Label>
            </div>

        </div>
    </StatCardWrapper> );
}
 
export default EmployeeCard;