import React, {FunctionComponent} from 'react';
import {Badge} from "react-bootstrap";
import {Link} from "react-router-dom"
import {IMarketingPage} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import {ADMIN_URL_PREFIX} from "../../../../constants/routes";
import {dateFormatter} from "../../../../utils/dateFormatting";


interface FundMarketingPageRowProps {
  marketingPage: IMarketingPage
}


const FundMarketingPageRow: FunctionComponent<FundMarketingPageRowProps> = ({marketingPage}) => {


  return <tr>
    <td><Link to={`/${ADMIN_URL_PREFIX}/marketingPage/${marketingPage.id}/edit`}>{marketingPage.title ? marketingPage.title : '[No title specified]'}</Link></td>
    <td></td>
    <td><Badge bg="secondary">Draft</Badge></td>
    <td>{dateFormatter(marketingPage.modified_at)}</td>
    <td>{marketingPage.created_by_name}</td>
  </tr>
};

export default FundMarketingPageRow;
