import Modal from "react-bootstrap/Modal";
import { SecondaryButton } from "../../../styles";
import { useEffect, useState } from "react";
import DistributionForm from "./components/DistributionForm";
import { generateDateTimeWithZeroTime } from "../../../../../../utils/dateFormatting";
import { getSumByProperty } from "../../../../../../utils/getValue";
import API from "../../../../../../api/backendApi";
import { toast } from "react-toastify";
import { isEmpty, map } from "lodash";
import { SUB_TABS } from "./components/DistributionForm/constants";
import { createDecimal } from "../../../../../../utils/decimal";

interface IDistributionModalProps {
  handleCloseModal: (_distId: string) => void;
  initState?: Record<string, any>;
  refreshData: (distId: string) => void;
}

const DistributionModal = ({
  handleCloseModal,
  initState,
  refreshData
}: IDistributionModalProps) => {
  const [state, setState] = useState<Record<string, any>>({});
  const {
    fund_or_deal_or_tranche,
    amount,
    formattedAllocations,
    allocations,
    date,
    carry_plan_name,
    id,
    source,
    tabName
  } = state;
  const handleSubmit = async () => {
    const isEdit = Boolean(initState?.id);

    const zeroIfEmpty = (_allocations:any[])=>{
      return map(_allocations,allocation=>{
        return {
          ...allocation,
          amount: createDecimal(allocation.amount).toString(),
          escrow: createDecimal(allocation.escrow).toString(),
          escrow_percentage: createDecimal(allocation.escrow_percentage).toString(),
        }
      })
    }

    const payloadAllocations = tabName === SUB_TABS.MANUAL_DISTRIBUTE ? zeroIfEmpty(allocations):  formattedAllocations
    const editPayload = {
      amount,
      escrow: Number(getSumByProperty(payloadAllocations, "escrow"))?.toFixed(2),
      allocations:payloadAllocations ,
      is_manual: tabName === SUB_TABS.MANUAL_DISTRIBUTE
    };

    const createPayload = {
      [fund_or_deal_or_tranche?.is_tranche ? "investment_tranche_external_id" : fund_or_deal_or_tranche?.is_deal ? 'deal_external_id': "fund_external_id"]:
      fund_or_deal_or_tranche?.value,
      date: generateDateTimeWithZeroTime(date),
      ...editPayload,
    };

    const res = isEdit
      ? await API.editDistributionDetail(id, editPayload)
      : await API.createDistribution(createPayload);
    if (res.success) {
      handleCloseModal(res.data.id?.toString() || id);
      refreshData(res.data.id?.toString())
      toast.success(
        `Distribution ${isEdit ? "updated" : "created"} for  ${
          fund_or_deal_or_tranche?.label || source
        }`
      );
    } else {
      toast.error("Something went wrong !!");
    }
  };

  const isValidData = Boolean(
    carry_plan_name && amount && date && formattedAllocations?.length
  );

  useEffect(() => {
    if (initState) setState(initState);
  }, [initState]);

  return (
    <>
      <Modal
        size={"xl"}
        show={true}
        onHide={() => handleCloseModal("")}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {initState && !isEmpty(initState) ? "Edit" : "Create"} Distribution
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DistributionForm state={state} setState={setState} />
        </Modal.Body>
        <Modal.Footer>
          <SecondaryButton onClick={handleSubmit} disabled={!isValidData}>
            {initState && !isEmpty(initState) ? "Save" : "Create"}
          </SecondaryButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DistributionModal;
