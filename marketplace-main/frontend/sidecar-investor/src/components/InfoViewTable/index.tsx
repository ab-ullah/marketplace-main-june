import { Cont, TableRow, LeftCol, RightCol, Text, Wrapper } from "./styles";
import Tooltip from "@material-ui/core/Tooltip";

type InfoItem = {
  label: string;
  value: string | JSX.Element;
};
type InfoCol = InfoItem[];
type Info = InfoCol[];

const TooltipWrapper = ({ enable, children, text }: any) => {
  if (enable)
    return (
        <Tooltip title={text} arrow>
          <span>{children}</span>
        </Tooltip>
    );

  return children;
};


const InfoViewTable = ({ info }: { info: Info }) => {
  return (
    <Wrapper>
      {info.map((_col: any[]) => (
        <Cont>
          {_col.map((dat: any) => (
            <TableRow>
              <LeftCol hideBorder={!dat?.value}>
                <TooltipWrapper text={dat?.label} enable>
                <Text>{dat?.label}</Text>
                </TooltipWrapper>
              </LeftCol>
              {dat.value && (
                <RightCol>
                   <TooltipWrapper text={dat?.value} enable>
                  <Text>{dat?.value}</Text>
                  </TooltipWrapper>
                </RightCol>
              )}
            </TableRow>
          ))}
        </Cont>
      ))}
    </Wrapper>
  );
};
export default InfoViewTable;