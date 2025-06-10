import React, { FunctionComponent, useState } from "react";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import {
  Title,
  FilterBox,
  InputBox,
  HeaderContainer,
  ButtonAndSearchContainer,
  Container,
  HideShowSection
} from "./styles";
import FundsList from "./components/FundsList";
import CreateFund from "./components/CreateFund";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NavableLoader from "../../components/NavableLoader";
import ExportButton from "../../components/ExportButton";

interface FundsProps {}

const Funds: FunctionComponent<FundsProps> = () => {
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Container>
      {isLoading && <NavableLoader />}
      <HideShowSection visible={!isLoading}>
        <HeaderContainer>
          <Title>List of available funds</Title>
          <ButtonAndSearchContainer>
            <FilterBox>
              <InputBox
                type="text"
                placeholder="Filter"
                value={filter}
                onChange={(e: any) => setFilter(e.target.value)}
              />
              <SearchOutlinedIcon />
            </FilterBox>
            <CreateFund />
          </ButtonAndSearchContainer>
        </HeaderContainer>
        <Row>
          <Col md={12} className="my-4">
            This is the page of all the available funds. To add a new fund click
            the purple Create Fund button. To edit an existing fund, click on the
            Edit button under the Fund Setup column.
          </Col>
        </Row>
        <Row>
          <Col md={12}>
          <FundsList filterKey={filter} setFinishedLoading={() => setIsLoading(false)} />
          </Col>
        </Row>
      </HideShowSection>
    </Container>
  );
};

export default Funds;
