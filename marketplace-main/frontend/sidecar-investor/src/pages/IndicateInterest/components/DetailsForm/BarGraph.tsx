import { FunctionComponent } from "react";
import map from "lodash/map";
import CurrencyFormat from "../../../../utils/FormattedCurrency";
import { BarGraphWrapper, BarItem } from "./styles";
import { Lens} from "@material-ui/icons";
import { handleFormatToCurrency } from "../../../../utils/currency";

export interface IData {
  label: string;
  value: number;
  displayValue?: any;
}

interface IBarGraph {
  data?: IData[];
  prefix?: string;
  hideInGraphData?: boolean;
  barHeight?: string;
  barItemColors?: string[];
  displayLegend?: boolean;
}

const defaultBarItemColors=['#4a47a3','#eca106','grey','blue']

const BarGraph: FunctionComponent<IBarGraph> = ({ data, prefix, hideInGraphData, barHeight,barItemColors,displayLegend }) => {
  return (
    <div>
    <BarGraphWrapper className="inspectlet-sensitive" height={barHeight}>
      {map(data, ({ label, value, displayValue }, index) => (
        <BarItem
          key={index}
          className={`bar-item-${index}`}
          flexValue={value}
          colors={barItemColors}
        >
          {!hideInGraphData && <>
          <span className="label">{label}</span>
          <span className="value">
            {displayValue? displayValue:
            <CurrencyFormat symbol={prefix} value={value} showCents={true}/>
}
          </span>
          </>}
        </BarItem>
      ))}
    </BarGraphWrapper>
    {displayLegend &&
    <div className="mt-4">
        {map(data, ({ label, value, displayValue }, index) => (
          <div className="d-flex align-items-center gap-2 mt-3">
            <Lens style={{ color: barItemColors?.[index], fontSize: "14px" }} />
            <p className="m-0">
              {label} : {displayValue? displayValue: <span> {handleFormatToCurrency(value,prefix?.trim())}  {prefix}</span>
            
}
            </p>
          </div>
        ))}
      </div>
      }
    </div>
    
  );
};

BarGraph.defaultProps = {
  data: [],
  prefix: 'USD',
  hideInGraphData: false,
  barHeight: "40px",
  barItemColors: defaultBarItemColors,
  displayLegend: false
};

export default BarGraph;
