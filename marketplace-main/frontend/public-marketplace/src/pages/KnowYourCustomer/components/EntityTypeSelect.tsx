/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { ChangeEvent, FunctionComponent } from 'react'
import get from 'lodash/get'
import { useParams } from 'react-router-dom'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { ErrorMessage } from 'formik'
import { isToolTipText } from '../../../components/ToolTip/interfaces'
import { CustomSelectTypeData } from '../../../interfaces/workflows'
import CommentWrapper from '../components/CommentsWrapper'
import ToolTip from '../../../components/ToolTip'
import { FieldComponent } from '../interfaces'
import { CommentsContext } from '../Context'
import {
	InnerFieldContainer,
	RadioButton,
	RadioInner,
	RadioInput,
} from '../styles'
import { useField } from '../hooks'
import { useSaveApplicationEntityTypeMutation } from '../../../api/rtkQuery/fundsApi'
import {
	KYC_PRIVATE_COMPANY_INVESTOR,
	KYC_LIMITED_PARTNERSHIP_INVESTOR,
	KYC_TRUST_INVESTOR,
	KYC_INVESTOR_TYPE,
	AML_FLOW_SLUGS,
} from '../constants'
import {OptionTypeBase} from "react-select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getEntityTypeConfig = (key: any) => {
	if (AML_FLOW_SLUGS && KYC_INVESTOR_TYPE)
		return {
			[AML_FLOW_SLUGS[key]]: KYC_INVESTOR_TYPE[key],
		}
	return {}
}

type EntityTypeSelectProps = FieldComponent

const EntityTypeSelect: FunctionComponent<EntityTypeSelectProps> = ({
	comments,
	question,
	customOnBlur
}) => {
	const { field, helpers, isFocused } = useField(question.id, question.type)
	const { externalId } = useParams<{ externalId: string }>()
	const [saveEntityType] = useSaveApplicationEntityTypeMutation()
	const { options } = question.data as CustomSelectTypeData
	const { helpText, label } = question

	const entityType = {
		...getEntityTypeConfig(KYC_PRIVATE_COMPANY_INVESTOR),
		...getEntityTypeConfig(KYC_LIMITED_PARTNERSHIP_INVESTOR),
		...getEntityTypeConfig(KYC_TRUST_INVESTOR),
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (question.disabled) return
		helpers.setValue(e.target.id)
	}

	const onClick = (value: string | number) => {
		helpers.setValue(value)
	}

	const handleBlur = (e: OptionTypeBase) => {
		if (customOnBlur) {
			customOnBlur(e)
		}
	}

	return (
		<InnerFieldContainer>
			<CommentsContext.Consumer>
				{({ recordUUID, fetchKYCRecord }) => (
					<Row className='mt-2'>
						<Col md={4} className='field-label'>
							{label}
							{isToolTipText(helpText) && (
								<ToolTip {...helpText} />
							)}
						</Col>
						{typeof helpText === 'string' && (
							<Col md={8} className='field-help-text'>
								<span>{helpText}</span>
							</Col>
						)}
						<Col md={8}>
							<Row>
								{options.map(option => {
									const isChecked =
										option.value == field.value // eslint-disable-line eqeqeq
									return (
										<RadioButton
											key={option.value}
											checked={isChecked}
											onClick={() => {
												saveEntityType({
													recordUUID,
													externalId,
													kycInvestorType: get(
														entityType,
														option.value,
													),
												}).then(fetchKYCRecord)
												onClick(option.value)
											}}
										>
											<input
												type='radio'
												value={option.value}
												id={option.value.toString()}
												name={question.id}
												checked={isChecked}
												onChange={handleChange}
												onBlur={handleBlur}
												onClick={() =>
													onClick(option.value)
												}
											/>
											<RadioInput checked={isChecked}>
												<RadioInner
													checked={isChecked}
												/>
											</RadioInput>
											<label>{option.label}</label>
										</RadioButton>
									)
								})}
							</Row>
							{!isFocused && (
								<ErrorMessage
									name={question.id}
									component='div'
								/>
							)}
						</Col>
					</Row>
				)}
			</CommentsContext.Consumer>
			{comments?.map(comment => (
				<CommentWrapper key={comment.id} comment={comment} />
			))}
		</InnerFieldContainer>
	)
}

export default EntityTypeSelect
