import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FormTextFieldRow } from "../../../../../../../../components/Form/TextField";
import { FormSelectorFieldRow } from "../../../../../../../../components/Form/SelectorField";
import { StyledButton, StyledTitle } from "./styles";
import { useUpdateCarryPoolMutation } from "../../../../../../../../api/rtkQuery/carryApi";
import API from "../../../../../../../../api/backendApi";
import map from "lodash/map";
import CheckboxSelector from "../../../../../../../../components/Form/CheckboxSelector";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import FilePreviewModal from "../../../../../../../../components/FilePreviewModal";

interface EditPoolModalProps {
  pool?: Record<string, any>;
  isOpen: boolean;
  onClose: (_shouldRefetch?:boolean) => void;
}

const EditPoolModal: React.FC<EditPoolModalProps> = ({
  pool,
  isOpen,
  onClose,
}) => {
  const [subPool, setSubPool] = useState<Record<string, any>>({
    name: "",
    bps: "",
    vehicle: null,
    share_class: null,
    vesting_schedule: null,
  });
  const [carryVehicleOptions, setCarryVehicleOptions] = useState<any[]>([]);
  const [vestingSchedulesOptions, setVestingSchedulesOptions] = useState<any[]>(
    []
  );
  const [docOptions, setDocOptions] = useState<any[]>([]);

  const [updateCarryPool, { isLoading }] = useUpdateCarryPoolMutation();

  const isDirty = subPool.name !== "";

  const handleChange = (value: any, name: string) => {
    setSubPool((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchVehicles = async () => {
    const response = await API.fetchCarryVehicles();
    if (response.success) {
      setCarryVehicleOptions(
        response.data?.map((vehicle: any) => ({
              ...vehicle,
          label: vehicle.legal_name,
          value: vehicle.id,
        }))
      );
    }
  };

  const fetchShareClasses = (vehicleId: any) => {
    const selectedVehicle = carryVehicleOptions?.find(
      (vehicle: any) => vehicle.id === vehicleId?.value
    );
    if (selectedVehicle) {
          return map(selectedVehicle?.classes,(shareClass: any) => ({
        ...shareClass.template_share_class,
        label: shareClass.template_share_class.legal_name,
        value: shareClass.template_share_class.id,
      }));
    } else return [];
  };
  
  const handleFetchVestingSchedule = async () => {
    const res = await API.fetchVestingSchedule();
    if (res.success) {
      const schedules = res?.data?.map((schedule: any) => ({
        label: schedule.name,
        value: schedule.id,
      }));
      setVestingSchedulesOptions(schedules || null);
    }
  };

    const handleFetchCarryDocuments = async () => {
      const res = await API.fetchCarryTemplateDocuments();
      if (res.success) {
        const docs = res.data?.map((doc: any) => ({
          label: `${doc.name} - ${doc.description}`,
          value: doc.id,
          file: doc.document
        }));
  
        setDocOptions(docs)
      }
    };

  useEffect(() => {
    fetchVehicles();
    handleFetchVestingSchedule();
    handleFetchCarryDocuments()
  }, []);

  useEffect(() => {
    if (pool) {
      setSubPool({
        name: pool.name,
        bps: "",
        vehicle: {label: pool.vehicle_name, value: pool.vehicle},
        share_class: {label: pool.template_share_class_name, value: pool.template_share_class},
        vesting_schedule: {label: pool.vesting_schedule.name, value: pool.vesting_schedule.id},
        carry_documents: map(get(pool,'carry_documents'),(doc:any)=>({value:doc.id,file: doc.document}))
      });
    }
  }, [pool]);

  const onSubmit = async () => {
      if (isDirty) {
        await updateCarryPool({
          poolId: pool?.id,
          name: subPool.name,
          vehicle: subPool?.vehicle?.value ?? null,
          template_share_class: subPool?.share_class?.value ?? null,
          vesting_schedule: subPool?.vesting_schedule?.value ?? null,
          carry_documents: map(get(subPool,'carry_documents'),(doc:any)=>doc.value)
        }).unwrap();
        onClose(true);
    }
  }

  return <Modal size="lg" show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        Edit Pool
      </Modal.Header>
      <Modal.Body>
        <FormTextFieldRow
          name="pool-name"
          placeholder="Enter pool name"
          value={subPool.name}
          label="Pool Name"
          onChange={(e: any) => handleChange(e.target.value, "name")}
        />
        <FormSelectorFieldRow
          label="Select vehicle to apply"
          name="vehicle"
          placeholder="Vehicle"
          onChange={(value: any) => {
            handleChange(value, "vehicle");
            handleChange(null, "share_class");
            handleChange(null, "vesting_schedule");
          }}
          value={subPool.vehicle}
          options={carryVehicleOptions}
        />
        <FormSelectorFieldRow
          label="Select share class to apply"
          name="share_class"
          placeholder="Share Class"
          onChange={(value: any) => {
            handleChange(value, "share_class");
            handleChange(
              vestingSchedulesOptions?.find(
                    (opt: any) => opt.value === value?.vesting_schedule
                  ) || null,
              "vesting_schedule"
            );
          }}
          value={subPool.share_class}
          options={fetchShareClasses(subPool.vehicle)}
        />
        <FormSelectorFieldRow
          label="Select vesting schedule to apply"
          name="vesting_schedule"
          placeholder="Select"
          onChange={(value: any) => handleChange(value, "vesting_schedule")}
          value={subPool.vesting_schedule}
          options={vestingSchedulesOptions}
        />
        
              
              <CheckboxSelector
                      label="Select template documents to apply to this subpool"
                      options={docOptions}
                      selectedOptions={get(subPool, "carry_documents", [])}
                      onChange={(value: any) =>
                        handleChange(value,"carry_documents")
                      }
                      name="carry_documents"
                      noOptSelectedTxt="Select"
                    />
                    {!isEmpty(get(subPool, "carry_documents", [])) && 
                   
                            <div style={{ marginTop: "12px" }}>
                              <StyledTitle>Documents</StyledTitle>
                              <div
                                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                              >
                                {map(get(subPool, "carry_documents", []), (elem: any) => (
                                  <FilePreviewModal
                                    documentId={elem.file.document_id}
                                    documentName={elem.file.title}
                                  />
                                ))}
                              </div>
                            </div>
                   }
      </Modal.Body>
      <Modal.Footer>
            <Button disabled={isLoading} variant="text" onClick={()=>onClose()}>Cancel</Button>
            <StyledButton disabled={!isDirty || isLoading} onClick={onSubmit}>Save</StyledButton>
      </Modal.Footer>
    </Modal>
}

export default EditPoolModal;