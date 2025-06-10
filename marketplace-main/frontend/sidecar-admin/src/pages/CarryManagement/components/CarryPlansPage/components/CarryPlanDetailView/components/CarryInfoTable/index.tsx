import { isEmpty } from "lodash";
import TooltipWrapper from "../../../../../../../../components/Tooltip";
import { Cont, TableRow, LeftCol, RightCol, Text, Wrapper } from "./styles";

type InfoItem = {
  label: string;
  value: string | JSX.Element;
};

type InfoCol = InfoItem[];

type Info = InfoCol[];

const CarryInfoTable = ({ info }: { info: Info }) => {
  return (
    <Wrapper>
      {info.map(
        (_col: any[], index) =>
          _col.some((elem) => !isEmpty(elem)) && (
            <Cont>
              {_col.map((dat: any) => (
                <TableRow>
                  {dat.label && (
                    <LeftCol
                      hideBorder={!dat?.value}
                      width={index === 0 ? "160px" : ""}
                    >
                      <TooltipWrapper text={dat?.label} enable>
                        <Text>{dat?.label}</Text>
                      </TooltipWrapper>
                    </LeftCol>
                  )}
                  {dat.value && (
                    <RightCol>
                      {typeof dat?.value === "string" ? (
                        <TooltipWrapper text={dat?.value} enable>
                          <Text>{dat?.value}</Text>
                        </TooltipWrapper>
                      ) : (
                        dat?.value
                      )}
                    </RightCol>
                  )}
                </TableRow>
              ))}
            </Cont>
          )
      )}
    </Wrapper>
  );
};

export default CarryInfoTable;
