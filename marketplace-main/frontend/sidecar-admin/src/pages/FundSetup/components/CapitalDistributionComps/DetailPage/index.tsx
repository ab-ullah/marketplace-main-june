import {
  TopRow as Row,
  BackButton,
  IconButton,
  ApproveButton,
  RowItem,
  Title,
  AmountCell,
  Text,
} from "./styles";
import Tooltip from "../../../../../components/Tooltip";
import backIcon from "../../../../../assets/images/arrow_back.svg";
import downloadIcon from "../../../../../assets/images/download-icon.svg";
import FormattedCurrency from "../../../../../utils/FormattedCurrency";
import RsuiteTable from "../../../../../components/Table/RSuite";
import { getColumns, ConfirmationModalText, TOOLTIP } from "./constants";
import { useMemo, useState } from "react";
import { standardizeDate } from "../../../../../utils/dateFormatting";
import API from "../../../../../api/backendApi";
import workflowAPI from "../../../../../api/workflowAPI";
import { APPROVED } from "../../../../../constants/taskStatus";
import ConfirmationModal from "./components/ConfirmationModal";
import { useAppSelector } from "../../../../../app/hooks";
import { selectFundDetail } from "../../../../FundDetail/selectors";
import get from "lodash/get";
import { TAB_NAME as capitalCallsSection } from "../../CapitalCallsSection/constants";
import { TAB_NAME as distributionNoticesSection } from "../../DistributionNoticesSection/constants";

const DetailPage = ({
  goBack,
  data,
  selectedRow,
  tabName,
}: {
  goBack: any;
  data: any[];
  selectedRow: any;
  tabName: string;
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const fundDetails = useAppSelector(selectFundDetail);

  const fundCurrencySymbol = get(fundDetails, "currency.symbol", "$");
  const currencyDetail = get(fundDetails, "currency");

  const {
    distribution_date,
    due_date,
    can_approve,
    document,
    task_id,
    approved_at,
    are_documents_generated,
  } = selectedRow;

  const title: { [key: string]: any } = {
    [capitalCallsSection]: "Capital Call",
    [distributionNoticesSection]: "Distribution",
  };

  const generateFooterData = (data: any[]) => {
    let result: { [key: string]: any } = {};
    for (let obj of data) {
      for (let key in obj) {
        if (result[key]) {
          result[key] += obj[key];
        } else {
          result[key] = obj[key];
        }
      }
    }

    result = {
      ...result,
      id: -1,
      isFooter: true,
      currency: currencyDetail,
      user: { first_name: "Total", last_name: "" },
    };

    return result;
  };

  const footerData = useMemo(() => {
    return generateFooterData(data);
  }, [data]);

  const handleConfirmApprove = async () => {
    const res = { success: false };
    if (can_approve) {
      try {
        const payload = { status: APPROVED, completed: true };
        await workflowAPI.updateTask(task_id, payload);
        res.success = true;
        setConfirmed(true);
      } catch {
        alert("Unable to approve");
      }
    }
    return res;
  };

  const handleHide = () => {
    setShowModal(false);
  };

  if (!fundDetails) return <></>;

  return (
    <div>
      <Row>
        <BackButton onClick={() => goBack()}>
          <img src={backIcon} alt="" />
          Back
        </BackButton>
        <RowItem>
          <IconButton
            variant="outline-primary"
            onClick={() =>
              API.downloadDocument(document.document_id, document.title)
            }
          >
            <img src={downloadIcon} alt="" />
            Download
          </IconButton>
          {!(approved_at || confirmed || !can_approve) && (
            <Tooltip text={TOOLTIP} enable={!are_documents_generated}>
              <span>
                <ApproveButton
                  disabled={!are_documents_generated}
                  onClick={() => setShowModal(true)}
                  variant="primary"
                >
                  Approve {title[tabName]}
                </ApproveButton>
              </span>
            </Tooltip>
          )}
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Title>{title[tabName]} Amount</Title>
          <AmountCell>
            <FormattedCurrency
              value={data.reduce((total, obj) => total + (obj.amount || 0), 0)}
              symbol={fundCurrencySymbol}
            />
          </AmountCell>
        </RowItem>
        <RowItem>
          <Text>{title[tabName]} Date: </Text>
          <Text style={{ color: "#607D8B" }}>
            {standardizeDate(due_date || distribution_date)}
          </Text>
        </RowItem>
      </Row>
      <RsuiteTable
        isLoading={false}
        columns={getColumns(tabName)}
        data={[...data, footerData]}
        rowSelection={false}
      />
      <ConfirmationModal
        showModal={showModal}
        handleHide={handleHide}
        handleConfirmApprove={handleConfirmApprove}
        confirmed={confirmed}
        displayText={
          ConfirmationModalText[tabName as keyof typeof ConfirmationModalText]
        }
      />
    </div>
  );
};

export default DetailPage;
