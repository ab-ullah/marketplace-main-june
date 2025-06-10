import React, {FunctionComponent} from 'react';
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";

import {IOpportunity} from "../../interfaces";
import {Link} from "react-router-dom";
import StyledBadge from "../../../../presentational/StyledBadge";
import { useCompanyPrefix } from '../../../../utils/hooks';


interface OpportunityRowProps {
  opportunity: IOpportunity,
}


const OpportunityRow: FunctionComponent<OpportunityRowProps> = ({opportunity}) => {
  const {companyPrefix} =useCompanyPrefix()
  return <tr key={opportunity.id}>
    <td>
      {opportunity.name}
    </td>
    <td>{opportunity.region}</td>
    <td>{opportunity.fund_type_name}</td>
    <td>{opportunity.risk_profile}</td>
    <td>{opportunity.investment_period}</td>
    <td><Link to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${opportunity.external_id}/profile`} className="link">
      <StyledBadge pill bg='primary'>Fund Page</StyledBadge>
    </Link>
    </td>
  </tr>
};

export default OpportunityRow;
