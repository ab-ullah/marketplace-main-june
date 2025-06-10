import React, {FunctionComponent} from 'react';

import {IOwnershipOrder} from "../../../../interfaces/investorOwnership";
import PendingOrderRow from "./PendingOrderRow";
import {SideCarStyledTable} from "../../../../presentational/StyledTableContainer";
import Table from "react-bootstrap/Table";

interface PendingOrdersProps {
  pendingOrders: IOwnershipOrder[]
}


const PendingOrders: FunctionComponent<PendingOrdersProps> = ({pendingOrders}) => {


  return <SideCarStyledTable>
    <Table responsive>
      <thead>
        <tr>
          <th>Pending Orders</th>
          <th>Investor</th>
          <th>Requested Allocation</th>
          <th>Status</th>
          <th>Confirmation Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {pendingOrders.map((pendingOrder) => (
          <PendingOrderRow key={pendingOrder.id} pendingOrder={pendingOrder}/>
        ))}
      </tbody>
    </Table>

  </SideCarStyledTable>
};

export default PendingOrders;
