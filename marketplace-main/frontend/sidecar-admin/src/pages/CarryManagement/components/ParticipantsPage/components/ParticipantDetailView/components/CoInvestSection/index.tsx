import { useEffect, useState } from "react";
import { formatCurrencyWithTwoDecimals } from "../../../../../../../../utils/currency";
import InfoTileLayout from "../../../../../InfoTileLayout";
import API from "../../../../../../../../api/backendApi";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { getCoinvestColumns, getCoinvestExportData } from "./constants";
import ToggleSwitch from "../../../../../../../../components/ToggleSwitch";
import reduce from "lodash/reduce";
import { get, isEmpty } from "lodash";
import NavableLoader from "../../../../../../../../components/NavableLoader";

const CoInvestSection = ({ participantId, setCoInvestExportData }: any) => {
  const [state, setState] = useState([]);
  const [showUSD, setShowUSD] = useState(true);
  const [isLoading,setIsLoading]=useState(true)

  const handleFetchParticipantCoinvestList = async () => {
    setIsLoading(true)
    const res = await API.fetchParticipantCoinvestList(participantId);
    if (res.success) {
      setState(res.data?.invested_funds);
    }
    setIsLoading(false)
  };

  const handleToggleChange = () => {
    setShowUSD((prev) => !prev);
  };

  const getTotalInUSD = (array: any[], attr: string) => {
    return reduce(
        array,
        (acc: any, obj: any) =>
          acc + Number(obj[attr] || 0) * get(obj, "currency.rate"),
        0
      ).toFixed(0)
  };

  useEffect(() => {
    if (participantId) handleFetchParticipantCoinvestList();
  }, [participantId]);

  const data = [
    {
      label: "Total Equity",
      value: formatCurrencyWithTwoDecimals(getTotalInUSD(state, "equity_commitment")),
    },
    {
      label: "Equity Commitment Called",
      value: formatCurrencyWithTwoDecimals(getTotalInUSD(state, "equity_called")),
    },
    {
      label: "Total Distributions to Date",
      value: formatCurrencyWithTwoDecimals(
        getTotalInUSD(state, "total_distributions")
      ),
    },
    {
      label: "Total Unrealized Gain/Loss",
      value: formatCurrencyWithTwoDecimals(getTotalInUSD(state, "gain")),
    },
    {
      label: "Total Net Equity",
      value: formatCurrencyWithTwoDecimals(getTotalInUSD(state, "current_net_equity")),
    },
    {
      label: "Total Gross Share of NAV",
      value: formatCurrencyWithTwoDecimals(getTotalInUSD(state, "nav_share")),
    },
  ];

  const totalRow={
    isFooter: true,
    fund_name:'Total: ',
    equity_called:formatCurrencyWithTwoDecimals(getTotalInUSD(state, "equity_called")),
    total_distributions:formatCurrencyWithTwoDecimals(getTotalInUSD(state, "total_distributions")),
    gain:formatCurrencyWithTwoDecimals(getTotalInUSD(state, "gain")),
    nav_share:formatCurrencyWithTwoDecimals(getTotalInUSD(state, "nav_share")),
    current_net_equity:formatCurrencyWithTwoDecimals(getTotalInUSD(state, "current_net_equity")),
    latest_nav:" ",
    currency_code:" "
  }

  useEffect(() => {
    setCoInvestExportData({
      tableColumns: getCoinvestColumns(showUSD),
      data: [...getCoinvestExportData(state, showUSD),...(showUSD && state.length)?[totalRow]:[]] || []
    })
  }, [state, showUSD])

  if (isLoading) return <NavableLoader />;
  return (
    <div>
      <InfoTileLayout data={data} />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <p style={{ marginBottom: "0px", marginRight: "10px" }}>
          Investment Currency
        </p>
        <ToggleSwitch
          title="USD"
          onChange={handleToggleChange}
          checked={showUSD}
        />
      </div>
      <RsuiteTable
      height="400px"
        allowColMinWidth={true}
        rowSelection={false}
        columns={getCoinvestColumns(showUSD)}
        data={[...state,...(showUSD && state.length)?[totalRow]:[]] || []}
        wordWrap={true}
        defaultSortBy=""
      />
    </div>
  );
};

export default CoInvestSection;
