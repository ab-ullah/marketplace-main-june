import map from "lodash/map";
import { CardCont, Title, Text, PointsContainer } from "./styles";
import { Col, Row } from "react-bootstrap";
import { limitCarryDecimalPlaces } from "../../../../../../../../../../../../utils/getValue";
import { isEmpty, truncate } from "lodash";
import FilePreviewModal from "../../../../../../../../../../../../components/FilePreviewModal";


const SubpoolSection = ({ subpools, selectedSubpool, handleSelectSubpool }: { subpools: any[], selectedSubpool?:any, handleSelectSubpool?:(_subpool:any)=>void }) => {
  return (
    <div style={{ padding: "20px" }}>
      <Row>
        {map(subpools, (subpool: any) => (
          <Col xs={12} sm={6}  lg={4} xl={3} onClick={ ()=>handleSelectSubpool? handleSelectSubpool(subpool):null} style={{cursor:handleSelectSubpool? "pointer":"default"}}>
            <SubpoolCard subpool={subpool} isSelected={selectedSubpool?.id===subpool.id}/>
          </Col>
        ))}
      </Row>
    </div>
  );
};

const SubpoolCard = ({ subpool, isSelected }: { subpool: Record<string, any>, isSelected:boolean }) => {
  const { name, vehicle_name, template_share_class_name, bps, allocated, un_allocated, vesting_schedule,carry_documents } = subpool;
  return (
    <CardCont isSelected={isSelected}>
      <div>
        <Title>{name}</Title>
        <Text>{vehicle_name}</Text>
        <Text>{template_share_class_name}</Text>
        <Text>{vesting_schedule?.label}</Text>
      </div>
      {!isEmpty(carry_documents) &&
      <div>
      <Title>Docs</Title>
      {map(carry_documents,(doc:any)=>
        <FilePreviewModal
          documentId={doc?.file?.document_id}
          documentName={doc?.file?.title}
          customDisplayButton={<div style={{cursor:'pointer', textDecoration:'underline'}}>{truncate(doc?.file?.title)}</div>}
          showPreviewIcon={false}
        />
        )}
      </div>
      }
      <div>
        <Title>Total Points: {limitCarryDecimalPlaces(bps)}</Title>
        <PointsContainer>
          <Text color="#607d8b">Allocated</Text>
          <Text color="#10AC84">{limitCarryDecimalPlaces(allocated)}</Text>
        </PointsContainer>
        <PointsContainer>
          <Text color="#607d8b">Unallocated</Text>
          <Text color="#F5A61D">{limitCarryDecimalPlaces(un_allocated)}</Text>
        </PointsContainer>
      </div>
    </CardCont>
  );
};



export default SubpoolSection;
