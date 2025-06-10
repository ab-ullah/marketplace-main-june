import React, {FunctionComponent, useEffect} from 'react';
import {ChooseFundHeading, FundListContainer, FundsHeading, FundsListContainer} from "./styles";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectEligibilityCriteriaFunds} from "../../selectors";
import {fetchFundsForCriteria} from "../../thunks";
import FundBlock from "./FundBlock";


interface FundsListProps {
}


const FundsList: FunctionComponent<FundsListProps> = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(fetchFundsForCriteria())
  }, [])
  const funds = useAppSelector(selectEligibilityCriteriaFunds)
  return <FundListContainer fluid>
    <Row>
      <FundsHeading>
        List of available funds
      </FundsHeading>
    </Row>
    <Row>
      <ChooseFundHeading>
        Choose your fund
      </ChooseFundHeading>
    </Row>
    <Row>
      <Col>
        <FundsListContainer>
          {funds.map(fund => <FundBlock key={`fund-${fund.id}`} fund={fund}/>)}
        </FundsListContainer>
      </Col>
    </Row>

  </FundListContainer>
};

export default FundsList;
