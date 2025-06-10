import { Col, Row } from "react-bootstrap";
import { InfoTile, InfoTitle, InfoValue, InfoWrapper, SubText } from "./styles";
import TooltipPopover from "../../../../components/TooltipPopover";

export type ITileInfo = {
  value: string | number;
  label: string;
  tooltip?: {
    heading: string;
    description: string;
  };
  subTitle?: string
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

export const InfoTileComp = ({ value, label, subTitle, tooltip }: any) => {
  return (
    <InfoTile>
    <InfoValue style={{ color: getColor(value) }}>{value}</InfoValue>
    <InfoWrapper>
    <InfoTitle>{label}</InfoTitle>
    {tooltip && <TooltipPopover tooltip={tooltip} />}
    </InfoWrapper>
    <SubText>{subTitle ?? ''}</SubText>
  </InfoTile>
  );
};

const InfoTileLayout = ({data, colProps}:{data:ITileInfo[], colProps?: IColProps | undefined}) => {
  return (
    <Row>
      {data.map((dat) => {
        const { value, label } = dat;
        let {md, lg, xs} = {md: 6, lg: data.length>2? 4: 6, xs: 12}
        if(colProps){
          md = colProps.md? colProps.md : md
          lg = colProps.lg? colProps.lg : lg
          xs = colProps.xs? colProps.xs : xs
        }
        return (
          <Col md={md} lg={lg} xs={xs} key={label}>
            <InfoTileComp value={value} label={label} tooltip={dat.tooltip} subTitle={dat.subTitle} />
          </Col>
        );
      })}
    </Row>
  );
};

export default InfoTileLayout;
