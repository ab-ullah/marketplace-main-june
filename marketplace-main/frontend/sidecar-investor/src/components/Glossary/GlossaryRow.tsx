import React, {FunctionComponent} from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styled from "styled-components";


const HeadingRow = styled(Row)`
  margin-top: 18px;
`

const TextRow = styled(Row)`
  padding-bottom: 5px;
`

const HeadingCol = styled(Col)`
  font-family: Quicksand Bold;
  font-style: normal;
  font-size: 15px;
  line-height: 19px;
  letter-spacing: 0.02em;
  color: #020203;
`

const TextCol = styled(Col)`
  font-family: Quicksand;
  font-style: normal;
  font-size: 15px;
  line-height: 19px;
  letter-spacing: 0.02em;
  color: #020203;
`

interface glossaryRowProps {
  data_point: string,
  definition: string
}


export const GlossaryRow: FunctionComponent<glossaryRowProps> = ({data_point, definition}) => {
  return <>
    <HeadingRow>
      <HeadingCol md={12}>
        {data_point}
      </HeadingCol>
    </HeadingRow>
    <TextRow>
      <TextCol md={12}>
        {definition}
      </TextCol>
    </TextRow>
  </>
}

export default GlossaryRow;
