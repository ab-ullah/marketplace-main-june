
import { FunctionComponent, useState, useMemo } from "react";
import get from "lodash/get";
import countBy from "lodash/countBy";
import size from "lodash/size";
import map from "lodash/map";
import Button from "react-bootstrap/Button";
import {
  APPROVED,
  PUBLISHED,
} from "../../../constants/eligibilityCriteriaStatus";
import { IEligibilityCriteria } from "../../../interfaces/EligibilityCriteria/criteria";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getFundEligibilityCriteria } from "../../EligibilityCriteria/thunks";
import { selectFundCriteria } from "../../EligibilityCriteria/selectors";
import { useBulkPublishMutation } from "../../../api/rtkQuery/fundsApi";
import FundCriteriaTable from "../../EligibilityCriteria/components/FundCriteriaList/components/FundCriteriaTable";
import CreateCriteriaButton from "../../EligibilityCriteria/components/FundCriteriaList/components/CreateCriteriaModal";
import { IFundBaseInfo } from "../../../interfaces/fundDetails";
import { HeaderWithSearch } from "../../../components/Header";
import { ContentContainer } from "../styles";
import Grid from "@material-ui/core/Grid";

interface IsReadyToPublishProps {
  fundId: number;
  shouldRefresh?: boolean;
}


const IsReadyToPublish: FunctionComponent<IsReadyToPublishProps> = ({
   fundId,
    shouldRefresh = false
}) => {

  const [updateBulkPublish] = useBulkPublishMutation();
  const dispatch = useAppDispatch();
  const fundCriteria = useAppSelector(selectFundCriteria);

  const isReadyForPublish = useMemo(() => {
    const count = countBy(fundCriteria, (criteria: IEligibilityCriteria) => {
      if (criteria.status === APPROVED) return "approved";
      if (criteria.status === PUBLISHED) return "published";
    });
    const publishable = get(count, "approved", 0) + get(count, "published", 0);
    return (
      count.approved && count.approved > 0 && publishable === size(fundCriteria)
    );
  }, [fundCriteria]);

  const handlePublish = () => {
    if (size(fundCriteria) > 0) {
      const criteriaIds = map(fundCriteria, "id");
      updateBulkPublish({ criteriaIds }).then((resp: any) => {
        if (get(resp, "data.status") === "success") {
          dispatch(getFundEligibilityCriteria(fundId));
        }
        if (shouldRefresh){
          window.location.reload()
        }
      });
    }
  };

  return <>
    {isReadyForPublish && (
        <Button style={{background: "#10AC84", border: "none"}} variant="primary" onClick={handlePublish}>
          Publish Eligibility
        </Button>
    )}
  </>
};

export default IsReadyToPublish;
