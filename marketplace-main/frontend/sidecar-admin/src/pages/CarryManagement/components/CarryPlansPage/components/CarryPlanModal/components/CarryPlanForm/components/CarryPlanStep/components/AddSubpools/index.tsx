import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import TrashIcon from "@material-ui/icons/DeleteOutlined";
import { FormTextFieldRow } from "../../../../../../../../../../../../components/Form/TextField";
import { FormSelectorFieldRow } from "../../../../../../../../../../../../components/Form/SelectorField";
import API from "../../../../../../../../../../../../api/backendApi";
import {
  isValidPositiveDecimal,
  isValidPositiveUncappedDecimal
} from "../../../../../../../../../../../../utils/getValue";
import {
  AddButton,
  PoolCont,
  DeleteIconWrapper,
  Title,
  Cont,
  HelperTextCont,
} from "./styles";
import map from "lodash/map";
import CheckboxSelector from "../../../../../../../../../../../../components/Form/CheckboxSelector";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import FilePreviewModal from "../../../../../../../../../../../../components/FilePreviewModal";
import { StyledTitle } from "../../styles";

const subpoolTemplate = {
  name: "",
  bps: "",
  vehicle: null,
  share_class: null,
  vesting_schedule: null,
};

const AddSubpools = ({
  vestingSchedulesOptions,
  setSubpools,
  errorMess,
  subpools,
  docOptions
}: {
  vestingSchedulesOptions: any[];
  setSubpools: (_subpools: Record<string, any>[]) => void;
  errorMess: any;
  subpools: any[];
  docOptions:any[]
}) => {
  //   const [subpools, setSubpools] = useState<Record<string, any>[]>([
  //     { ...subpoolTemplate },
  //   ]);
  const [carryVehicleOptions, setCarryVehicleOptions] = useState<any[]>([]);

  const isDisabled = Boolean(subpools?.[0]?.id);

  const handleChange = (index: number, value: any, name: string) => {
    const newSubpools = [...subpools];
    newSubpools[index][name] = value;
    setSubpools(newSubpools);
  };

  const handleAddField = () => {
    setSubpools([...subpools, { ...subpoolTemplate }]);
  };

  const handleRemoveField = (index: number) => {
    const newSubpools = subpools.filter((_, i) => i !== index);
    setSubpools(newSubpools);
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

  const fetchShareClasses = (selectedVehicle: Record<string, any>) => {
    if (selectedVehicle) {
      return map(selectedVehicle?.classes,(shareClass: any) => ({
        ...shareClass.template_share_class,
        label: shareClass.template_share_class.legal_name,
        value: shareClass.template_share_class.id,
      }));
    } else return [];
  };

  //   const handleSubmit = (event: React.FormEvent) => {
  //     event.preventDefault();
  //     console.log(fields);
  //   };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (!subpools) {
      setSubpools([{ ...subpoolTemplate }]);
    }
  }, []);

  return (
    <Cont>
      <Title>Carry Pools (optional)</Title>
      <HelperTextCont>Create one or more pools totalling 100 points</HelperTextCont>
      <Col>
        {map(subpools,(subpool, index) => (
          <PoolCont>
            <Row key={index}>
              <Col lg={2}>
                <FormTextFieldRow
                  label="Carry Pool Name"
                  placeholder=""
                  name="name"
                  onChange={(e: any) =>
                    handleChange(index, e.target.value, "name")
                  }
                  value={subpool.name}
                  disabled={isDisabled}
                />
              </Col>
              <Col lg={2}>
                <FormSelectorFieldRow
                  label="Select vehicle to apply"
                  name="vehicle"
                  placeholder="Vehicle"
                  onChange={(value: any) => {
                    handleChange(index, value, "vehicle");
                    handleChange(index, null, "share_class");
                    handleChange(index, null, "vesting_schedule");
                  }}
                  value={subpool.vehicle}
                  options={carryVehicleOptions}
                  isDisabled={isDisabled}
                />
              </Col>
              <Col lg={2}>
                <FormSelectorFieldRow
                  label="Select share class to apply"
                  name="share_class"
                  placeholder="Share Class"
                  onChange={(value: any) => {
                    handleChange(index, value, "share_class");
                    handleChange(
                      index,
                      vestingSchedulesOptions?.find(
                        (opt: any) => opt.value == value.vesting_schedule
                      ) || null,
                      "vesting_schedule"
                    );
                  }}
                  value={subpool.share_class}
                  options={fetchShareClasses(subpool.vehicle)}
                  isDisabled={isDisabled}
                />
              </Col>
              <Col lg={3}>
                <FormSelectorFieldRow
                  label="Select vesting schedule to apply"
                  name="vesting_schedule"
                  placeholder="Select"
                  onChange={(value: any) =>
                    handleChange(index, value, "vesting_schedule")
                  }
                  value={subpool.vesting_schedule}
                  options={vestingSchedulesOptions}
                  isDisabled={isDisabled}
                />
              </Col>
              <Col lg={2}>
                <FormTextFieldRow
                  label="Max # of Points in Pool"
                  placeholder="e.g. 100"
                  name="bps"
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (isValidPositiveUncappedDecimal(val) || val === "")
                      handleChange(index, val, "bps");
                  }}
                  value={subpool.bps}
                  disabled={isDisabled}
                />
              </Col>
              <Col lg={4}>
              
              <CheckboxSelector
                      label="Select template documents to apply to this subpool"
                      options={docOptions}
                      selectedOptions={get(subpool, "carry_documents", [])}
                      onChange={(value: any) =>
                        handleChange(index,value,"carry_documents")
                      }
                      name="carry_documents"
                      noOptSelectedTxt="Select"
                      isDisabled={isDisabled}
                    /></Col>
                    {!isEmpty(get(subpool, "carry_documents", [])) && 
                    <Col lg={12}>
                            <div style={{ marginTop: "12px" }}>
                              <StyledTitle>Documents</StyledTitle>
                              <div
                                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                              >
                                {map(get(subpool, "carry_documents", []), (elem: any) => (
                                  <FilePreviewModal
                                    documentId={elem.file.document_id}
                                    documentName={elem.file.title}
                                  />
                                ))}
                              </div>
                            </div>
                    </Col>}
              {!isDisabled && (
                <Col>
                  <DeleteIconWrapper>
                    <TrashIcon onClick={() => handleRemoveField(index)} />
                  </DeleteIconWrapper>
                </Col>
              )}
            </Row>
          </PoolCont>
        ))}
      </Col>
      {errorMess && <p className="text-danger">{errorMess}</p>}
      {!isDisabled && (
        <AddButton onClick={handleAddField}>+ Add Carry Pool</AddButton>
      )}
    </Cont>
  );
};

export default AddSubpools;
