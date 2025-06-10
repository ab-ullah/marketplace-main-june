import React, {FunctionComponent} from 'react';
import Select, {OptionTypeBase} from "react-select";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Container from "react-bootstrap/Container";

const StyledContainer = styled(Container)`
  padding: 20px 0;
  margin: 0;
`
const LabelCol = styled(Col)`
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 21px;
  letter-spacing: 0.15px;
  color: #393940;
`


const SelectorCol = styled(Col)<{ greyBg?: boolean }>`
  .select__control {
    font-family: Quicksand Medium;
    padding: 4px 10px;
    background: ${props => props.greyBg ? '#F2F3F5' : '#FFFFFF'};
    font-style: normal;
    font-size: 18px;
    line-height: 24px;
    border-radius: 8px;
    color: ${props => props.theme.palette.common.sectionHeading};
    border: 1px solid #D5CBCB;
  }

  .select__value-container {
    padding: 0;
    border: none;
  }

  .select__indicator-separator {
    display: none;
  }

  .select__menu {
    font-family: Quicksand;
    padding: 14px 16px;
    background: #F2F3F5;
    border-radius: 8px;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 24px;
    color: ${props => props.theme.palette.common.sectionHeading};
  }

`

interface InvestorProfileSelectorProps {
  onChange: (value: OptionTypeBase) => void;
  value: OptionTypeBase |null | undefined;
  options: OptionTypeBase[];
  greyBg?: boolean
}

const InvestorProfileSelector: FunctionComponent<InvestorProfileSelectorProps> = ({onChange, value, options, greyBg}) => {
  return <StyledContainer>
    <Row className={'m-0'}>
      <LabelCol md={12} className='field-label'>
        Investor:
      </LabelCol>
    </Row>
    <Row className={'mt-2 mx-0'}>
      <SelectorCol md={4} greyBg={greyBg}>
        <Select
          placeholder={'Investor'}
          onChange={onChange}
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          value={value}
          name={'investorProfile'}
          options={options}
        />
      </SelectorCol>
    </Row>
  </StyledContainer>
}

export default InvestorProfileSelector;
