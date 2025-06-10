import { FunctionComponent, useState, useMemo } from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectFundCriteria } from "../../EligibilityCriteria/selectors";
import FundCriteriaTable from "../../EligibilityCriteria/components/FundCriteriaList/components/FundCriteriaTable";
import CreateCriteriaButton from "../../EligibilityCriteria/components/FundCriteriaList/components/CreateCriteriaModal";
import { IFundBaseInfo } from "../../../interfaces/fundDetails";
import { HeaderWithSearch } from "../../../components/Header";
import { ContentContainer } from "../styles";
import Grid from "@material-ui/core/Grid";
import IsReadyToPublish from "./IsReadyToPublish";

interface EligibilityCriteriaProps {
  fund: IFundBaseInfo;
}

const EligibilityCriteriaWithHeader: FunctionComponent<EligibilityCriteriaProps> = ({
  fund,
}) => {
  const [filter, setFilter] = useState<string>("");

  return (
    <ContentContainer>
      <HeaderWithSearch
        title="Eligibility Criteria"
        isSubtitle
        onSearch={setFilter}
        searchValue={filter}
      >
        <CreateCriteriaButton fund={fund} />
        <IsReadyToPublish fundId={fund.id}></IsReadyToPublish>
      </HeaderWithSearch>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <p>
            This is where you can create eligibility rules for investors in
            various countries/jurisdictions. You can create rules for an
            investor coming from a particular region (ex: Europe) or an
            individual country (ex: US).{" "}
          </p>
          <p>
            Additionally, you can add criteria based on where the fund is
            domiciled. If the jurisdiction has no criteria but investors will
            still be able to invest, please select the No Local Requirement block and
            designate that jurisdiction. Investors from countries that are not
            included in a block will be deemed not eligible.{" "}
          </p>
          <p>
            When you are ready to start creating your criteria, click the
            purple create button and pick the country or countries you want to
            create the criteria for.
          </p>
        </Grid>
      </Grid>
      <FundCriteriaTable fund={fund} filter={filter} />
    </ContentContainer>
  );
};

export default EligibilityCriteriaWithHeader;
