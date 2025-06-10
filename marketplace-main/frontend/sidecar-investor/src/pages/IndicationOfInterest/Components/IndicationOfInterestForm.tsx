import {Form, Formik} from 'formik'
import React, {FC} from 'react'
import {Button} from 'react-bootstrap'
import TextInput from '../../IndicateInterest/components/DetailsForm/TextInput'
import RadioSelect from './RadioButtons'
import {getSchemaValidation, INVESTOR_TYPE_OPTIONS, QUESTION_LABELS_MAPPINGS} from '../constants'
import {IndicateInterestFormWrapper, StyledForm} from '../styles'
import {each, get} from 'lodash'
import CurrencyInput from '../../IndicateInterest/components/DetailsForm/CurrencyInput'
import { useAppSelector } from '../../../app/hooks'
import { selectUserInfo } from '../../User/selectors'

interface IIndicationOfInterestFormProps {
    minimumInvestment: string | undefined,
    currencySymbol: string,
    currencyCode: string,
    handleSubmit: (response: any) => void
}

const IndicationOfInterestForm: FC<IIndicationOfInterestFormProps> = ({minimumInvestment, currencySymbol, currencyCode, handleSubmit}) => {

    const userInfo = useAppSelector(selectUserInfo);


    const onSubmit = (values: any) => {
        const keys = Object.keys(values)
        const response: any = {}
        each(keys, key => {
            response[QUESTION_LABELS_MAPPINGS[key]] = values[key]
        })
        handleSubmit(response)
    }

    return <IndicateInterestFormWrapper>
        <Formik
            initialValues={{
                investor_name: get(userInfo, 'display_name', ''),
                investment_type: '',
                investment_amount: 0
            }}
            validationSchema={getSchemaValidation(minimumInvestment ? parseInt(minimumInvestment) : 1000, currencySymbol, currencyCode)}
            onSubmit={onSubmit}
        >
            {({
          values,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid
        }) => (
            <StyledForm onSubmit={handleSubmit} className="interest-form">
                <TextInput
                name={'investor_name'}
                label={QUESTION_LABELS_MAPPINGS.investor_name}
                placeholder={'Name'}
                value={values.investor_name}
                onChange={handleChange}
                onBlur={handleBlur}
          />
         <RadioSelect
              label={QUESTION_LABELS_MAPPINGS.investment_type}
              name="investment_type"
              onChange={(value: any) => setFieldValue("investment_type", value)}
              options={INVESTOR_TYPE_OPTIONS}
              value={values.investment_type}
            />
            <CurrencyInput
              name={"investment_amount"}
              label={`${QUESTION_LABELS_MAPPINGS.investment_amount} (${currencySymbol}${currencyCode})`}
              placeholder={"0"}
              prefix={currencySymbol}
              value={values.investment_amount}
              disabled={false}
              onChange={(value: any) => {
                setFieldValue("investment_amount", value)
              }}
              helpText={`Min: ${currencySymbol} ${minimumInvestment ? minimumInvestment.toLocaleString() : 0} ${currencyCode}`}
              onBlur={() => {}}
            />
                <Button variant='primary'  type="submit" className='mt-4 mb-4'>Submit</Button>
            </StyledForm>
        )}
        </Formik>
    </IndicateInterestFormWrapper>
}

export default IndicationOfInterestForm;