import Container from "react-bootstrap/Container";
import { StyledForm } from "../../../../../../../../presentational/forms";
import { ErrorMessage, Formik } from "formik";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import { INITIAL_VALUES, validationSchema } from "./constants";
import { DatePickerContainer, HoverText, ResultWrapper, VestedCol } from "./styles";
import DatePickerComponent from "../../../../../../../../components/DatePicker";
import moment from "moment";
import { getRefPoolId } from "../../../../utils";
import { useParams } from "react-router-dom";
import { calculateDateDiffInDays, calculateNextDate } from "../../../../../../../../utils/dateFormatting";
import { Col, Row } from "react-bootstrap";
import { useState } from "react";
import API from "../../../../../../../../api/backendApi"
import TooltipWrapper from "../../../../../../../../components/Tooltip";
import InfoIcon from "@material-ui/icons/InfoOutlined";

interface VestingScheduleFormProps {
  closeModal: () => void;
  schedules: any[];
  hierarchy: any[];
  allocation: any;
}

const ButtonsContainer = styled.div`
  text-align: right;
`;

const VestingScheduleForm = ({
  closeModal,
  schedules,
  hierarchy,
  allocation,
}: VestingScheduleFormProps) => {
  const { externalId } = useParams<{ externalId: string }>();
  const [vestedPointsData, setVestedPointsData]=useState<any>(null)
  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    const { vesting_start_date,vesting_calculation_date, vesting_id } = values;
    const fund_external_id = externalId;
    const { base_pool_id, parent_pool_id } = getRefPoolId(hierarchy);

    const payload = {
      fund_external_id,
      base_pool_id,
      parent_pool_id,
      allocations_id: allocation.allocations_id,
      vesting_calculation_date,
      vesting_id,
      vesting_start_date
    };

    const res = await API.fetchCalculatedVestedPoints(payload)

    if(res.success){
      setVestedPointsData(res.data)
    }

    setSubmitting(false);
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12} lg={6}>
          <Formik
            initialValues={INITIAL_VALUES}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize
          >
            {({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              setFieldValue,
              errors,
            }) => {
              return (
                <StyledForm onSubmit={handleSubmit}>
                  <StyledForm.Group controlId="vesting_id">
                    <StyledForm.Label>Select Schedule</StyledForm.Label>

                    <StyledForm.Control
                      as="select"
                      onChange={handleChange}
                      name="vesting_id"
                      onBlur={handleBlur}
                      value={values.vesting_id}
                    >
                      <option value="">Select Schedule...</option>
                      {schedules.map((schedule, index) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.name}
                        </option>
                      ))}
                    </StyledForm.Control>
                    {values.vesting_id && (
                      <TooltipWrapper
                        enable={!!values.vesting_id}
                        text={
                          schedules.find(
                            (schedule) => schedule.id == values.vesting_id
                          )?.description
                        }
                      >
                        <HoverText>Hover to see info for this schedule <InfoIcon /></HoverText>
                      </TooltipWrapper>
                    )}
                    <ErrorMessage
                      className="text-danger"
                      name="vesting_id"
                      component="div"
                    />
                  </StyledForm.Group>

                  <DatePickerContainer>
                    <p className="date-title">Vesting Start Date</p>

                    <div className="datepicker">
                      <DatePickerComponent
                        placeholder="Vesting Start Date"
                        onChange={(value) => {
                          setFieldValue("vesting_start_date", value);
                          if (
                            values.vesting_calculation_date &&
                            calculateDateDiffInDays(
                              value,
                              values.vesting_calculation_date || ""
                            ) <= 1
                          ) {
                            setFieldValue(
                              "vesting_calculation_date",
                              calculateNextDate(value, 1)
                            );
                          }
                        }}
                      />
                    </div>

                    <ErrorMessage
                      className="text-danger"
                      name="vesting_start_date"
                      component="div"
                    />
                  </DatePickerContainer>

                  <DatePickerContainer>
                    <p className="date-title">Vesting Calculation Date</p>

                    <div className="datepicker">
                      <DatePickerComponent
                        placeholder="Vesting Calculation Date"
                        value={
                          values.vesting_calculation_date
                            ? new Date(values.vesting_calculation_date)
                            : null
                        }
                        minDate={
                          new Date(
                            values.vesting_start_date
                              ? calculateNextDate(values.vesting_start_date, 1)
                              : Date.now()
                          )
                        }
                        onChange={(value) =>
                          setFieldValue("vesting_calculation_date", value)
                        }
                      />
                    </div>

                    <ErrorMessage
                      className="text-danger"
                      name="vesting_calculation_date"
                      component="div"
                    />
                  </DatePickerContainer>

                  <ButtonsContainer className="text-right">
                    <Button
                      variant="outline-primary"
                      type="submit"
                      className={"submit-button"}
                      disabled={isSubmitting || Object.keys(errors).length > 0}
                    >
                      Calculate
                    </Button>
                    <Button
                      variant="outline-primary"
                      type="cancel"
                      className={"cancel-button"}
                      disabled={isSubmitting}
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                  </ButtonsContainer>
                </StyledForm>
              );
            }}
          </Formik>
        </Col>
        <Col md={12} lg={6}>
          <ResultWrapper>
            {vestedPointsData ? (
              <>
                <VestedCol  sm={12}>
                  <p>{vestedPointsData.vested_points} / {allocation.bps}</p>
                  <p>Vested Points</p>
                </VestedCol>
                <VestedCol  sm={12}>
                  <p>{vestedPointsData.vested_percentage} %</p>
                  <p>Vested Percentage</p>
                </VestedCol>
              </>
            ) : (
              <span>Fill form to calculate vested points</span>
            )}
          </ResultWrapper>
        </Col>
      </Row>
    </Container>
  );
};

export default VestingScheduleForm;
