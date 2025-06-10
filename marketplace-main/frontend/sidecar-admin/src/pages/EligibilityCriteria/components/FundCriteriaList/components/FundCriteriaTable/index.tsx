import { FunctionComponent, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Badge from "react-bootstrap/Badge";
import _filter from "lodash/filter";
import { useAppDispatch, useAppSelector } from "../../../../../../app/hooks";
import { dateFormatter } from "../../../../../../utils/dateFormatting";
import {
  selectfetchingEligibilityCriteria,
  selectFundCriteria,
} from "../../../../selectors";
import { ADMIN_URL_PREFIX } from "../../../../../../constants/routes";
import { IEligibilityCriteria } from "../../../../../../interfaces/EligibilityCriteria/criteria";
import { getFundEligibilityCriteria } from "../../../../thunks";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { IFundBaseInfo, IFundDetail } from "../../../../../../interfaces/fundDetails";
import { stringFoundIn } from "../../../../../../utils/stringFiltering";
import Actions from "./Actions";
import { FormId } from "./styles";
import { useDeleteEligibilityCriteriaMutation } from "../../../../../../api/rtkQuery/eligibilityApi";

interface FundCriteriaTableProps {
  fund: IFundBaseInfo | IFundDetail;
  height?: string;
  filter?: string;
}

const getTableColumns = (fund: IFundBaseInfo, handleDelete: (eligbilityCriteriaId: number) => void) => [
  {
    title: "Rule country/Region",
    dataKey: "name",
    flexGrow: 1,
    Cell: (criteria: IEligibilityCriteria) => (
      <FormId to={`/${ADMIN_URL_PREFIX}/eligibility/${criteria.id}/edit`}>
        {criteria.name}
      </FormId>
    ),
  },
  {
    title: "Status",
    dataKey: "status_name",
    flexGrow: 1,
    Cell: (criteria: IEligibilityCriteria) => (
      <Badge bg="secondary">{criteria.status_name}</Badge>
    ),
  },
  {
    title: "Last Edit",
    dataKey: "name",
    flexGrow: 1,
    Cell: (criteria: IEligibilityCriteria) => (
      <>{dateFormatter(criteria.last_modified)}</>
    ),
  },
  {
    title: "Creator",
    dataKey: "creator_name",
    flexGrow: 1,
  },
  {
    title: "Actions",
    dataKey: "name",
    flexGrow: 1,
    Cell: (criteria: IEligibilityCriteria) => (
        <Actions fund={fund} criteria={criteria} handleDelete={handleDelete} disabled={criteria.status_name === "Published"} />
      )
  },
];

const FundCriteriaTable: FunctionComponent<FundCriteriaTableProps> = ({
  fund,
  height,
  filter,
}) => {
  const [filteredCriteria, setFilteredCriteria] = useState<any[]>([]);
  const fundCriteria = useAppSelector(selectFundCriteria);
  const isFetching = useAppSelector(selectfetchingEligibilityCriteria);
  const [deleteEligbilityCriteria] = useDeleteEligibilityCriteriaMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getFundEligibilityCriteria(fund.id));
  }, [dispatch, fund.id]);

  useEffect(() => {
    if (filter) {
      const criteria = fundCriteria.filter(({ creator_name, name }) =>
        stringFoundIn(filter, creator_name, name)
      );
      setFilteredCriteria(criteria);
    } else {
      setFilteredCriteria(fundCriteria);
    }
  }, [fundCriteria, filter]);

  const handleDelete = (eligbilityCriteriaId: number) => {
    deleteEligbilityCriteria({id: eligbilityCriteriaId}).then(() => {
      dispatch(getFundEligibilityCriteria(fund.id));
    })
  }


  return (
      <RsuiteTable
        height={height ? height : "calc(100vh - 288px)"}
        rowSelection={false}
        isLoading={isFetching}
        columns={getTableColumns(fund, handleDelete)}
        data={filteredCriteria}
      />
  );
};

export default FundCriteriaTable;
