/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/require-default-props */
import React, { FunctionComponent, useEffect } from 'react'
import uniqBy from 'lodash/uniqBy'
import get from 'lodash/get'
import {
	Field,
	FieldProps,
	Formik,
	FormikHelpers,
	FormikValues,
	FormikProps,
	useFormikContext,
} from 'formik'
import AutoSave from '../AutoSave'
import { FormValues, DispatchStatus } from '../../interfaces'
import { Comment, Schema } from '../../../../interfaces/workflows'
import {
	getAnswerInputComponent,
	getIsFieldEnabled,
	handleValidation,
} from '../../utils'
import CommentWrapper from '../CommentsWrapper'

interface CardProps {
	schema: Schema
	onSubmit?: (
		values: FormikValues,
		helpers: FormikHelpers<FormValues>,
	) => Promise<void>
	initialValues: FormikValues
	// eslint-disable-next-line react/no-unused-prop-types
	ignoreRequired?: boolean
	disableAutosave?: boolean
	isParticipant?: boolean
	recordId: number
	onStatusChange?: DispatchStatus
	innerRef?: React.MutableRefObject<{
		[key: string]: FormikProps<FormikValues>
	}>
	recordComments?: {
		[key: string]: Comment[]
	}
}

const CardStatus = ({
	onStatusChange,
	participantId,
}: {
	onStatusChange: DispatchStatus
	participantId: number
}) => {
	const { errors, dirty, isValidating, isSubmitting } = useFormikContext()

	useEffect(() => {
		const hasErrors = Object.keys(errors).length > 0
		const newStatus = { dirty, hasErrors, isValidating, isSubmitting }
		onStatusChange({ newStatus, participantId })
	}, [
		onStatusChange,
		participantId,
		errors,
		dirty,
		isValidating,
		isSubmitting,
	])

	return null
}

const CardContainer: FunctionComponent<CardProps> = ({
	schema,
	onSubmit,
	initialValues,
	disableAutosave,
	recordId,
	isParticipant,
	onStatusChange,
	innerRef,
	recordComments,
}) => {
	const onValidate = (values: FormikValues) =>
		handleValidation(values, schema)

	const atSubmit = async (
		values: FormikValues,
		helpers: FormikHelpers<FormValues>,
	) => {
		// eslint-disable-next-line no-unused-expressions
		onSubmit && (await onSubmit(values, helpers))
	}

	const getComments = (question: any) => {
		const questionId = `participant_${recordId || ''}_${question.id}.`
		const comments = uniqBy(get(recordComments, questionId), 'id')
		return comments
	}

	return (
		<Formik
			initialValues={initialValues}
			validate={onValidate}
			onSubmit={atSubmit}
			enableReinitialize
			validateOnMount={false}
			innerRef={ref =>
				innerRef !== undefined && ref !== null
					? (innerRef.current[recordId] = ref)
					: undefined
			}
		>
			{(formikProps: FormikValues) => (
				<div>
					{!disableAutosave && <AutoSave />}
					{isParticipant && onStatusChange && (
						<CardStatus
							onStatusChange={onStatusChange}
							participantId={recordId}
						/>
					)}
					{schema.map(question => {
						const isFieldEnabled = getIsFieldEnabled(
							formikProps.values,
							question.field_dependencies,
						)
						if (!isFieldEnabled) return null
						const AnswerInput = getAnswerInputComponent(question)
						const comments = getComments(question)

						return (
							<Field key={question.id}>
								{(_: FieldProps) => (
									<>
										<AnswerInput
											key={question.id}
											question={question}
										/>
										{comments?.map(comment => (
											<CommentWrapper
												key={comment.id}
												comment={comment}
											/>
										))}
									</>
								)}
							</Field>
						)
					})}
				</div>
			)}
		</Formik>
	)
}

export default CardContainer
