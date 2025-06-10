import styled from "styled-components";
import DefaultIndicateInterestForm from "./DefaultIndicateInterestForm";
import RiversideDetailsForm from "./RiversideIndicateInterestForm";
import { useGetFundDetailsQuery } from "../../../../api/rtkQuery/fundsApi";
import { useParams } from "react-router-dom";
import { get } from "lodash";


export const FormContainerDiv = styled.div`
  width: 100%;
  padding: 24px 45px;
  background: #eceff1;
`;

export const TotalCont = styled.div`
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 4px;
`;

const DetailsForm =(props:any)=>{
  const { externalId } = useParams<{ externalId: string }>();
  const { data: fundDetails, isLoading } = useGetFundDetailsQuery(externalId);

  if(isLoading) return null
  return(
    <div>
      {(get(fundDetails,'show_new_commitment_flow')) ?
      <RiversideDetailsForm fundDetails={fundDetails} {...props}/> 
      :   
      <DefaultIndicateInterestForm fundDetails={fundDetails} {...props}/>
}
    </div>
  )
}

export default DetailsForm


