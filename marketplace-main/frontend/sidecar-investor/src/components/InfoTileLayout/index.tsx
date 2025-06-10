import { Col, Row } from "react-bootstrap";
import { InfoTile, InfoTitle, InfoValue, SubText } from "./styles";
import internal from "stream";
import { ITooltip } from "../../interfaces/carryManagement";
import TooltipPopover from "../CarryTooltip/carryTooltip";

export type ITileInfo = {
  value: any;
  label: string;
  subTitle?: string;
  tooltip?: ITooltip | null;
  onClick?: (...args: any[]) => any
}

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

export const InfoTileComp = ({ value, label, tooltip, subTitle }: ITileInfo) => {
  return (
    <InfoTile>
      <InfoValue style={{ color: getColor(value) }}>{value}</InfoValue>
      <InfoTitle>
        {label}
        {tooltip && <TooltipPopover tooltip={tooltip} />}
        </InfoTitle>
        <SubText>{subTitle ?? ''}</SubText>
      
    </InfoTile>
  );
};

const InfoTileLayout = ({data, colProps}:{data:ITileInfo[], colProps?: IColProps | undefined}) => {
  return (
    <Row>
      {data.map((dat) => {
        const { value, label, tooltip, subTitle } = dat;
        let {md, lg, xs} = {md: 6, lg: data.length>2? 4: 6, xs: 12}
        if(colProps){
          md = colProps.md? colProps.md : md
          lg = colProps.lg? colProps.lg : lg
          xs = colProps.xs? colProps.xs : xs
        }
        return (
          <Col md={md} lg={lg} xs={xs} key={label} className={'mb-3'}>
            <InfoTileComp value={value} label={label} tooltip={tooltip} subTitle={subTitle} />
          </Col>
        );
      })}
    </Row>
  );
};

export default InfoTileLayout;
