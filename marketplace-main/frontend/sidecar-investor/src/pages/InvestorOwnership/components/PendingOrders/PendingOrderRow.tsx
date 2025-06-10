import React, {FunctionComponent} from 'react';
import {IOwnershipOrder} from "../../../../interfaces/investorOwnership";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import Button from "react-bootstrap/Button";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import {Link} from "react-router-dom";
import { useCompanyPrefix } from '../../../../utils/hooks';


interface PendingOrderRowProps {
  pendingOrder: IOwnershipOrder,
}


const PendingOrderRow: FunctionComponent<PendingOrderRowProps> = ({pendingOrder}) => {
  const {companyPrefix} =useCompanyPrefix()
  const currencySymbol = pendingOrder.currency?.symbol;
  return <tr key={`${pendingOrder.id}-row`}>
    <td>{pendingOrder.ownership}</td>
    <td>{pendingOrder.investor_name}</td>
    <td>
      <FormattedCurrency
        value={pendingOrder.requested_allocation}
        symbol={currencySymbol}/>
    </td>
    <td>No response yet</td>
    <td>{pendingOrder.confirmation_date}</td>
    <td>{pendingOrder.can_edit &&
    <Link to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/funds/${pendingOrder.fund_external_id}/invest`}>
      <Button>Edit Allocation</Button>
    </Link>}</td>
  </tr>

};

export default PendingOrderRow;
