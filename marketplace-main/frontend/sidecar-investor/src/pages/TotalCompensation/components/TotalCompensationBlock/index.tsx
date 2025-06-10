import {BlockTitle} from "../SummaryBlock/styles";
import {formatCurrencyWithTwoDecimals} from "../../../../utils/currency";
import CustomPieChart, {DataItem} from "../../../../components/PieChart";
import {getSumByProperty} from "../../../../utils/getValue";


const TotalCompensationBlock = ({ info }: { info: DataItem[] }) => {
    const PieChartColors: Record<string, any> = {
        salary: "#470C75",
        bonus: "#610094",
        total_benefits: '#413C69'
    };
    return (
        <div>
            <BlockTitle>Total Compensation</BlockTitle>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    minWidth: "400px",
                    height: "425px",
                }}
            >
                <CustomPieChart
                    data={info}
                    colors={PieChartColors}
                    centerContent={
                        <>
                            <p className="label">Total</p>
                            <p className="value" style={{ color: "#4A47A3" }}>
                                {formatCurrencyWithTwoDecimals(getSumByProperty(info, "value"))}
                            </p>
                        </>
                    }
                />
            </div>
        </div>
    );
};

export default TotalCompensationBlock;
