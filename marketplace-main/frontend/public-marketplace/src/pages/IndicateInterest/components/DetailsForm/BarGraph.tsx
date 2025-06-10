import { FunctionComponent } from "react";
import map from "lodash/map";
import CurrencyFormat from "../../../../utils/FormattedCurrency";
import { BarGraphWrapper, BarItem } from "./styles";

interface IData {
  label: string;
  value: number;
}

interface IBarGraph {
  data?: IData[];
  prefix?: string;
}

const BarGraph: FunctionComponent<IBarGraph> = ({ data, prefix }) => {
  return (
    <BarGraphWrapper>
      {map(data, ({ label, value }, index) => (
        <BarItem
          key={index}
          className={`bar-item-${index}`}
          flexValue={value}
        >
          <span className="label">{label}</span>
          <span className="value">
            <CurrencyFormat symbol={prefix} value={value} showCents={true}/>
          </span>
        </BarItem>
      ))}
    </BarGraphWrapper>
  );
};

BarGraph.defaultProps = {
  data: [],
  prefix: 'USD'
};

export default BarGraph;
