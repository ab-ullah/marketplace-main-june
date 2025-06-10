import React, {FunctionComponent, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";

import {selectOpportunities} from "../../selectors";
import {fetchOpportunities} from "../../thunks";
import {SideCarStyledTable} from "../../../../presentational/StyledTableContainer";
import OpportunityRow from "./OpportunityRow";
import Table from "react-bootstrap/Table";
import {useParams} from "react-router-dom";

interface FundsListProps {
}


const OpportunitiesList: FunctionComponent<FundsListProps> = () => {
  const {companySlug} = useParams<{ companySlug: string }>();
  const dispatch = useAppDispatch();
  const opportunities = useAppSelector(selectOpportunities);

  useEffect(() => {
    dispatch(fetchOpportunities(companySlug));
  }, [])


  return <SideCarStyledTable>
    <Table responsive>
      <thead>
        <tr>
          <th>Fund</th>
          <th>Region/Country</th>
          <th>Type</th>
          <th>Risk Profile</th>
          <th>Investment Period</th>
          <th>Learn More</th>
        </tr>
      </thead>
      <tbody>
      {opportunities.map((opportunity) => (
        <OpportunityRow opportunity={opportunity} key={`row-${opportunity.id}`}/>
      ))}
      </tbody>
    </Table>
  </SideCarStyledTable>
};

export default OpportunitiesList;
