import { Button, Modal } from "react-bootstrap"
import * as Yup from "yup";
import { PointsFieldWrapper, PointsReallocationsStatsWrapper, StyledButton } from "./styles";
import { Formik } from "formik";
import { FormSelectorFieldRow } from "../../../../../../../../components/Form/SelectorField";
import { get, isEmpty } from "lodash";
import { useMoveUnallocatedPointsMutation } from "../../../../../../../../api/rtkQuery/carryApi";
import FormNumberField from "../../../../../../../../components/Form/NumberField";
import { decimalSubtract, decimalSum } from "../../../../../../../../utils/decimal";


export const VALIDATION_SCHEMA = Yup.object({
  source_pool: Yup.object().shape({
    label: Yup.string().required('Required'),
    value: Yup.string().required('Required'),
  }).required("Required").nullable(),
  target_pool: Yup.object().shape({
    label: Yup.string().required('Required'),
    value: Yup.string().required('Required'),
  }).required('Required').nullable(),
  points_to_move: Yup.number().required("Required").min(0, '# of unallocated points should be greater than 0').nullable()
});

const TransferUnallocatedPointsModal = ({
  isOpen,
  pool,
  availablePools,
  onClose
}: any) => {

  const [moveUnallocatedPoints, { isLoading }] = useMoveUnallocatedPointsMutation();

  const getSourceRemainingPoints = (id: number, newPoints: number, type: string) => {
    const pool = availablePools.find((subpool: any) => subpool.id === id)
    if (pool) {
      if (type === 'source') {
        return decimalSubtract(pool.un_allocated,newPoints).toString() 
      } else {
        return decimalSum(pool.un_allocated,newPoints).toString()
      }
    }
    return 0;
  }

  const onSubmit = async (values: any) => {
      console.log("values are ", values)
      const payload = {source_pool_id: values.source_pool.value,  target_pool_id : values.target_pool.value, points: values.points_to_move};
      await moveUnallocatedPoints(payload).unwrap()
      onClose(true);
  }


  return <Modal size="lg" show={isOpen} onHide={onClose}>
    <Modal.Header closeButton>
      Transfter Unallocated Points
    </Modal.Header>
    <Modal.Body>
      <Formik
        initialValues={{
          source_pool: pool ? { label: pool.name, value: pool.id } : null,
          target_pool: null,
          points_to_move: 0,
        }}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={onSubmit}
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          errors
        }) => (
          <form onSubmit={handleSubmit}>
            <FormSelectorFieldRow
              label="From which pool do you want to take unallocated points? "
              name="source_pool"
              placeholder="Select source pool"
              onChange={(value: any) => {
                setFieldValue("source_pool", value);
                setFieldValue("target_pool", null)
              }}
              onBlur={handleBlur}
              value={values.source_pool}
              options={availablePools.map((pool: any) => ({ label: pool.name, value: pool.id }))}
            />
            <FormSelectorFieldRow
              label="To which pool do you want to add unallocated points? "
              name="target_pool"
              placeholder="Select target pool"
              onChange={(value: any) => setFieldValue("target_pool", value)}
              onBlur={handleBlur}
              value={values.target_pool}
              options={availablePools.filter(((pool: any) => pool.id !== values.source_pool?.value)).map((pool: any) => ({ label: pool.name, value: pool.id }))}
            />
            <PointsFieldWrapper>
              <FormNumberField
                label="# of unallocated points to move"
                name="points_to_move"
                placeholder="# of unallocated points to move"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.points_to_move} />
            </PointsFieldWrapper>
            {
              values.source_pool?.value && values.target_pool && values.points_to_move ? <PointsReallocationsStatsWrapper>
                <p>{values.source_pool.label} - Total New Unallocated Points: {getSourceRemainingPoints(values.source_pool.value, values.points_to_move, 'source')}</p>
                <p>{get(values, 'target_pool.label')} - Total New Unallocated Points: {getSourceRemainingPoints(get(values, 'target_pool.value'), values.points_to_move, 'target')}</p>
              </PointsReallocationsStatsWrapper> : null
            }
            <Modal.Footer>
              <Button disabled={isLoading} variant="text" onClick={()=>onClose()}>Cancel</Button>
              <StyledButton disabled={isLoading || !isEmpty(errors)} type="submit">Transfer</StyledButton>
            </Modal.Footer>
          </form>
        )}
      </Formik>
    </Modal.Body>
  </Modal>
}

export default TransferUnallocatedPointsModal;