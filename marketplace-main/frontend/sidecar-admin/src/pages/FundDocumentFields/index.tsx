import React, { useMemo, VoidFunctionComponent } from "react";
import Container from "react-bootstrap/Container";
import { useParams } from "react-router-dom";
import { useGetDocumentFieldsQuery } from "../../api/rtkQuery/fundsApi";
import { Title } from "../Funds/styles";
import FieldsList from "./Components/FieldsList";
import { SectionWrapper } from "./styles";

const FundDocumentFields: VoidFunctionComponent = () => {
  const {fund_external_id} = useParams<{ fund_external_id: string }>();
  const { data } = useGetDocumentFieldsQuery(fund_external_id);

  const filterData = useMemo(() =>{
      if(data) {
          let response = JSON.parse(data);
          return response['documents_filter'];
      }
      return "";
  }, [data])

  const fieldData = useMemo(() => {
      if(data) {
          let response = JSON.parse(data);
          return response['fields'];
      }
      return {}
  }, [data])

  const sections = useMemo(() => {

    if (data) {
        let response = JSON.parse(data);
        return Object.keys(response['fields']);
    }
    return [];
  }, [data]);

  return (
    <Container className="page-container" fluid>
      <Title>Available Fields</Title>
        <h4>Document Filter</h4>
        {filterData && <pre>{filterData}</pre>}
        {!filterData && <pre>No filter defined</pre>}
      {sections.map((section) => (
        <SectionWrapper>
          <h4>{section}</h4>
          {fieldData[section] && <FieldsList fields={fieldData[section]} />}
        </SectionWrapper>
      ))}
    </Container>
  );
};

export default FundDocumentFields;
