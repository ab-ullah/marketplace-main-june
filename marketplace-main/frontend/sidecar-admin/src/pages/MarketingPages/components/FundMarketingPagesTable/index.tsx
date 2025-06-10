import React, {FunctionComponent, useEffect, useState} from 'react';
import Row from "react-bootstrap/Row";

import Col from "react-bootstrap/Col";
import {fetchMarketingPages} from "../../thunks";
import {selectFetchingState, selectMarketingPages} from "../../selectors";
import FundMarketingPageRow from "./MarketingPageRow";
import {IMarketingPage} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import {EligibilityTable} from "../../../../presentational/EligibilityTable";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {MarketingPagesContainer} from "./styles";
import {IFundBaseInfo} from "../../../../interfaces/fundDetails";
import {stringFoundIn} from "../../../../utils/stringFiltering";


interface FundMarketingPagesTableProps {
  fund: IFundBaseInfo;
  filter?: string;
}


const FundMarketingPagesTable: FunctionComponent<FundMarketingPagesTableProps> = ({ fund, filter }) => {
  const [filteredMarketingPages, setFilteredMarketingPages] = useState<IMarketingPage[]>([])
  const marketingPages = useAppSelector(selectMarketingPages)
  const isFetching = useAppSelector(selectFetchingState)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchMarketingPages(fund.id))
  }, [])

  useEffect(() => {
    if (filter) {
      const pages = marketingPages.filter(({ title, created_by_name }) => stringFoundIn(filter, title, created_by_name))
      setFilteredMarketingPages(pages)
    } else {
      setFilteredMarketingPages(marketingPages)
    }
  }, [marketingPages, filter])

  if(isFetching) return <></>

  return <MarketingPagesContainer fluid className="marketing-pages-container">
    <Row>
      <Col>
        <EligibilityTable hover borderless responsive>
          <thead>
          <tr>
            <th>Page Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last Edit</th>
            <th>Creator</th>
          </tr>
          </thead>
          <tbody>
          {filteredMarketingPages.map((marketingPage: IMarketingPage) => <FundMarketingPageRow
            key={`table-criteria-${marketingPage.id}`} marketingPage={marketingPage}/>)}
          </tbody>
        </EligibilityTable>
      </Col>
    </Row>
  </MarketingPagesContainer>
};

export default FundMarketingPagesTable;
