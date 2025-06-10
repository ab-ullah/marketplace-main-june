import { useGetCarryPlansConfigQuery } from "../../../../../../api/rtkQuery/companyApi";
import ExportButton from "../../../../../../components/ExportButton";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import {getColumns, ICarryFund} from "./constants";

interface IFundListView {
  handleSelectFundToView: (arg1: string, arg2: any) => void;
  fundsList:ICarryFund[]
}

const FundsListView = ({
  handleSelectFundToView,
  fundsList
}: IFundListView) => {

  const {data, isLoading, isFetching} = useGetCarryPlansConfigQuery()

  if(isLoading || isFetching) return null

  return (
    <>
      <div className="mt-3">
        <div className="d-flex justify-content-end py-2">
        <ExportButton 
          fileName="carry-funds"
          tableColumns={getColumns(handleSelectFundToView, data?.tooltips ?? [])}
          data={fundsList}
          />
        </div>
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(handleSelectFundToView, data?.tooltips ?? [])}
          data={fundsList}
          defaultSortBy=""
        />
      </div>
    </>
  );
};

export default FundsListView;
