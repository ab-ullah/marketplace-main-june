import { Col, Row } from "react-bootstrap";
import {ClickableInfoValue, InfoTile, InfoTitle, InfoValue, SubText} from "./styles";
import {ITileInfo} from "../InfoTileLayout";

export type IColProps = {
  md?: number;
  lg?: number;
  xs?: number;
}

const getColor = (value: string | number) => {
  let color = "black";
  switch ((typeof value)==='string'? (value as string).toLowerCase(): value) {
    case "pending":
      color = "#FF8A00";
      break;

    default:
      color = "black";
      break;
  }

  return color;
};

export const InfoTileComp = (tiles: ITileInfo[]) => {
  return (
    <InfoTile className='infotile-container'>
      {tiles.map(({label, value, subTitle, onClick}) => {
        return <div className='subinfotile'>
          {onClick && <ClickableInfoValue onClick={onClick} style={{ color: ["string","number"].includes(typeof value) ? getColor(value): "black" }}>{value}</ClickableInfoValue>}
          {!onClick && <InfoValue style={{ color: ["string","number"].includes(typeof value) ? getColor(value): "black" }}>{value}</InfoValue>}
          <InfoTitle>{label}</InfoTitle>
          <SubText>{subTitle ?? ''}</SubText>
        </div>
      })}
    </InfoTile>
  );
};

const SubInfoTileLayout = ({data, colProps}:{data:ITileInfo[][], colProps: IColProps}) => {
  return (
    <Row>
      {data.map((dat) => {
        return (
          <Col md={colProps.md} lg={colProps.lg} xs={colProps.xs}>
            {InfoTileComp(dat)}
          </Col>
        );
      })}
    </Row>
  );
};

export default SubInfoTileLayout;
