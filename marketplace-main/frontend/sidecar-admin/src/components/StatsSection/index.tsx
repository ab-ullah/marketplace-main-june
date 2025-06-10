import {FunctionComponent} from "react";
import {Title, Value, Wrapper} from "./styles";
import FormattedCurrency from "../../utils/FormattedCurrency";

interface IStatsSection {
  value: string;
  title: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
  currencySymbol?: string;
}

const StatsSection: FunctionComponent<IStatsSection> = ({ value, title, isCurrency, isPercentage, currencySymbol }) => {
  return (
    <Wrapper>
      <Value>
        {isCurrency ? (
          <FormattedCurrency
            value={value ? parseFloat(value) : 0}
            symbol={currencySymbol}
          />
        ) : isPercentage ?
            (
            <>{value}%</>
            )
            : (
            <>{value}</>
        )}
      </Value>
      <Title>{title}</Title>
    </Wrapper>
  );
};

StatsSection.defaultProps = {
  currencySymbol: "USD"
}

export default StatsSection;
