import React from 'react';
import Container from "react-bootstrap/Container";
import GlossaryRow from "./GlossaryRow";
import styled from "styled-components";
import {GLOSSARY_DEFINITION_HASH} from "../../constants/glossaryItemsHash";

const GlossaryContainer = styled(Container)`
  max-height: 400px;
  overflow: auto;
`

function Glossary() {
  const glossaryDataPoints = Object.keys(GLOSSARY_DEFINITION_HASH);
  glossaryDataPoints.sort();

  return <GlossaryContainer>
    {glossaryDataPoints.map(dataPoint => <GlossaryRow
      data_point={dataPoint}
      definition={GLOSSARY_DEFINITION_HASH[dataPoint]}
    />)}
  </GlossaryContainer>
}

export default Glossary;
