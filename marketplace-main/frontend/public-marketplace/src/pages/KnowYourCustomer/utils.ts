/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep, get, merge, size, toLower, trim, uniqBy } from 'lodash'
import {
	CommentsByRecord,
	FieldComponent,
	FormErrors,
	FormStatus,
	FormStatusByParticipant,
	FormValues,
	RecordDocument,
} from 'interfaces/KnowYourCustomer'
import {
	AnswerTypes,
	Card,
	FieldDependency,
	FieldDependencyValueType,
	KYCDocument,
	KYCRecordResponse,
	Question,
	Schema,
	WorkFlow,
} from 'interfaces/workflows'
import moment from 'moment'
import {
	AML_KYC_TYPE_WORKFLOW,
	BASE_FORM_STATUS,
	DEFAULT_NON_SELECTABLE_OPTION,
	FLOW_TYPES,
	KYC_INVESTOR_TYPE,
	STATUS_CODES,
} from './constants'
import SelectInput from './components/CustomSelect'
import DateInput from './components/DateInput'
import FileUploadInput from './components/FileUpload'
import NumberInput from './components/NumberInput'
import Checkbox from './components/checkbox'
import SelectCountryInput from './components/CountrySelect'
import RadioInput from './components/RadioSelect'
import EntityTypeInput from './components/EntityTypeSelect'
import TextInput from './components/TextInput'
import CurrencyField from './components/currencyField'
import SectionHeader from './components/SectionHeader'

export const getAMLWorkflows = (fundWorkflows: WorkFlow[]) =>
	fundWorkflows.filter(w => w.type === FLOW_TYPES.KYC)

export const getAMLWorkFlowByTypeSlug = (
	workflows: WorkFlow[],
	slug: string | null,
) => {
	if (slug === null) return
	const selectedWF = getAMLWorkflows(workflows).find(w =>
		w.slug.startsWith(slug),
	)
	if (!selectedWF) return
	selectedWF.cards = selectedWF.cards.sort((a, b) => a.order - b.order)
	// eslint-disable-next-line consistent-return
	return selectedWF
}

export const parseDocumentsToAnswers = (docs: KYCDocument[]) =>
	docs.reduce((acc, doc) => {
		if (acc[doc.field_id] === undefined) {
			acc[doc.field_id] = {
				pendingUploads: [],
				documentsInRecord: [doc],
			}
		} else {
			acc[doc.field_id].documentsInRecord.push(doc)
		}
		return acc
	}, {} as any)

export const getStatusById = (statusId: number) =>
	Object.values(STATUS_CODES).find(status => status.id === statusId)

export const parseKYCRecord = (
	kycRecord: KYCRecordResponse,
	docs?: KYCDocument[],
) => {
	const {
		id,
		status: statusId,
		kyc_participants,
		kyc_investor_type,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
		user: _,
		workflow,
		...rest
	} = kycRecord
	const status = getStatusById(statusId) || null
	const workflowSlug = workflow?.slug
	const docAnswers = parseDocumentsToAnswers(docs ?? [])
	const answers = { ...rest, ...docAnswers }
	const investorType = Object.keys(KYC_INVESTOR_TYPE).find(
		(key: string) => KYC_INVESTOR_TYPE[key] === kyc_investor_type,
	)
	let participants = null
	let participantsIds = null
	if (
		kyc_participants !== undefined &&
		kyc_participants !== null &&
		Array.isArray(kyc_participants)
	) {
		participants = (kyc_participants as KYCRecordResponse[]).sort(
			(a, b) => a.id - b.id,
		)
		participantsIds = participants.map(p => p.id)
	}
	return {
		id,
		status,
		answers,
		participants,
		participantsIds,
		investorType,
		workflowSlug,
	}
}

const getUniqComments = (
	currentComments: CommentsByRecord,
	comment: any,
	documentKey: string,
) => {
	const comments = [
		cloneDeep(comment),
		...get(
			cloneDeep(currentComments),
			`${comment.module}.${comment.module_id}.${comment.question_identifier}.${documentKey}`,
			[],
		),
	]
	return uniqBy(comments, 'id')
}

export const mergeComments = (
	currentComments: CommentsByRecord,
	newComments: any,
) => {
	let mergedComments = { ...currentComments }
	newComments.forEach(
		(comment: {
			document_identifier: any
			module: any
			module_id: any
			question_identifier: any
		}) => {
			const documentKey = comment.document_identifier
				? comment.document_identifier
				: ''
			const categorizedComment = {
				[comment.module]: {
					[comment.module_id]: {
						[comment.question_identifier]: {
							[documentKey]: getUniqComments(
								currentComments,
								comment,
								documentKey,
							),
						},
					},
				},
			}
			mergedComments = merge(mergedComments, categorizedComment)
		},
	)
	return mergedComments
}

export const getAMLInitialWorkflow = () => AML_KYC_TYPE_WORKFLOW

export const getIndividualFormInitialValues = (
	form: Question<AnswerTypes>[],
	currentAnswers?: FormValues,
) =>
	form.reduce((acc, question) => {
		if (question.type === 'section_header') return acc
		if (currentAnswers && currentAnswers[question.id]) {
			acc[question.id] = currentAnswers[question.id]
		} else if (
			question.type === 'custom-select' ||
			question.type === 'select-country'
		) {
			acc[question.id] = DEFAULT_NON_SELECTABLE_OPTION.value as string
		} else if (question.type === 'date') {
			acc[question.id] = null
		} else if (question.type === 'file_upload') {
			acc[question.id] = {
				pendingUploads: [],
				documentsInRecord: [],
			} as any
		} else {
			acc[question.id] = ''
		}
		return acc
	}, {} as FormValues)

export const getIsFieldEnabled = (
	formValues: FormValues,
	field_dependencies?: FieldDependency<FieldDependencyValueType>[],
) => {
	if (
		field_dependencies === undefined ||
		// eslint-disable-next-line eqeqeq
		Object.keys(field_dependencies).length == 0
	)
		return true
	return field_dependencies.some(({ field, relation, value }) => {
		const fieldValue = formValues[field]
		if (fieldValue === null) return false
		switch (relation) {
			case 'equals':
				return fieldValue == value // eslint-disable-line eqeqeq
			case 'not_equals':
				return fieldValue != value // eslint-disable-line eqeqeq
			case 'less_than':
				return fieldValue < value
			case 'greater_than':
				return fieldValue > value
			case 'in':
				return Array.isArray(value) && value.some(v => v == fieldValue) // eslint-disable-line eqeqeq
			case 'not_in':
				return Array.isArray(value) && !value.some(v => v == fieldValue) // eslint-disable-line eqeqeq
			default:
				return false
		}
	})
}

const shouldFieldBeRequired = (
	question: Question<AnswerTypes>,
	formValues: { [key: string]: string | null },
) => {
	if (!question.required) return false
	if (question.field_dependencies) {
		const isFieldEnabled = getIsFieldEnabled(
			formValues,
			question.field_dependencies,
		)
		if (!isFieldEnabled) return false
	}
	return true
}

export const calculateNumberLength = (value: number) => {
	if (value === 0) return 1
	return Math.ceil(Math.log10(value + 1))
}

export const handleValidation = (values: FormValues, schema: Schema) => {
	const errors: FormErrors = {}
	schema.forEach((question: Question<AnswerTypes>) => {
		const { id, label } = question
		if (question.type === 'number') {
			if (!values[id]) {
				if (shouldFieldBeRequired(question, values)) {
					errors[id] = `${label} is required`
				}
			} else {
				const value = Number(values[id])
				if (question.data.minLength) {
					if (
						calculateNumberLength(value) < question.data.minLength
					) {
						errors[
							id
						] = `${label} must be at least ${question.data.minLength} digits`
					}
				}
				if (question.data.maxLength) {
					if (
						calculateNumberLength(value) > question.data.maxLength
					) {
						errors[
							id
						] = `${label} must be at most ${question.data.maxLength} digits`
					}
				}
				if (question.data.exactLength) {
					if (
						calculateNumberLength(value) !==
						question.data.exactLength
					) {
						errors[
							id
						] = `${label} must be exactly ${question.data.exactLength} digits`
					}
				}
				if (question.data.min) {
					if (value < question.data.min) {
						errors[
							id
						] = `${label} must be at least ${question.data.min}`
					}
				}
				if (question.data.max) {
					if (value > question.data.max) {
						errors[
							id
						] = `${label} must be at most ${question.data.max}`
					}
				}
			}
		}
		if (question.type === 'currency') {
			const value = values[id]
			if (!value) {
				if (shouldFieldBeRequired(question, value)) {
					errors[id] = `${label} is required`
				}
			}
		}
		if (question.type === 'date') {
			const value = values[id]
			if (!value) {
				if (shouldFieldBeRequired(question, values)) {
					errors[id] = `${label} is required`
				}
			}
			if (value) {
				const date = new Date(value)
				// eslint-disable-next-line no-restricted-globals
				if (isNaN(date.getTime())) {
					errors[id] = `${label} must be a valid date`
				} else {
					if (question.data?.min) {
						if (
							value &&
							moment(value).isBefore(moment(question.data.min))
						) {
							errors[
								id
							] = `${label} must be after ${question.data.min}`
						}
					}
					if (question.data?.max) {
						if (
							value &&
							moment(value).isAfter(moment(question.data.max))
						) {
							errors[
								id
							] = `${label} must be before ${question.data.max}`
						}
					}
					if (question.data?.afterToday) {
						const currentDate = moment().format('YYYY-MM-DD')
						if (!moment(value).isAfter(currentDate))
							errors[id] = `${label} must be after ${currentDate}`
					}
				}
			}
		}
		if (question.type === 'file_upload') {
			const value = values[id] as unknown as RecordDocument
			const { filesLimit } = question.data
			if (
				!value ||
				(size(value.documentsInRecord) === 0 &&
					size(value.pendingUploads) === 0)
			) {
				if (shouldFieldBeRequired(question, values)) {
					errors[id] = `${label} is required`
				}
			}
			if (
				filesLimit !== undefined &&
				value.documentsInRecord.length > filesLimit
			) {
				errors[id] = `${label} must be less than ${filesLimit} files`
			}
		}
		if (question.type === 'text') {
			const value = values[id]
			if (!value) {
				if (shouldFieldBeRequired(question, values)) {
					errors[id] = `${label} is required`
				}
			}
			if (value) {
				if (question.data.pattern) {
					const regex = new RegExp(question.data.pattern)
					if (!regex.test(value)) {
						errors[
							id
						] = `${label} must match the pattern ${question.data.pattern}`
					}
				}
				if (question.data.minLength) {
					if (value.length < question.data.minLength) {
						errors[
							id
						] = `${label} must be at least ${question.data.minLength} characters`
					}
				}
				if (question.data.maxLength) {
					if (value.length > question.data.maxLength) {
						errors[
							id
						] = `${label} must be at most ${question.data.maxLength} characters`
					}
				}
				if (question.data.notAllowed) {
					question.data.notAllowed.forEach(excludedTerm => {
						const testValue = trim(toLower(value))
						// console.log("Test Value ", testValue)
						if (excludedTerm === testValue) {
							errors[id] = `${label} can not be ${value}`
						}
					})
				}
			}
		}
		if (
			question.type === 'custom-select' ||
			question.type === 'select-country'
		) {
			const value = values[id]
			if (!value || DEFAULT_NON_SELECTABLE_OPTION.value === value) {
				if (shouldFieldBeRequired(question, values)) {
					errors[id] = `${label} is required`
				}
			}
		}
		if (question.type === 'radio-select') {
			const value = values[id]
			if (!value) {
				if (shouldFieldBeRequired(question, values)) {
					errors[id] = `${label} is required`
				}
			}
		}
	})
	return errors
}

export const parseCard = (card: Card, currentAnswers?: FormValues) => {
	const { schema } = card
	const initialValues = getIndividualFormInitialValues(schema, currentAnswers)
	const title = card.name
	const repeteable = card.is_repeatable
	return { initialValues, schema, title, repeteable }
}

interface CustomSelectProps extends FieldComponent {
}


export const getAnswerInputComponent = (question: Question<AnswerTypes>): React.FunctionComponent<CustomSelectProps> => {
	switch (question.type) {
		case 'custom-select':
			return SelectInput
		case 'date':
			return DateInput
		case 'file_upload':
			return FileUploadInput
		case 'number':
			return NumberInput
		case 'radio-select':
			if (question.id === 'aml-kyc-type-selection') return EntityTypeInput
			return RadioInput
		case 'checkbox':
			return Checkbox
		case 'select-country':
			return SelectCountryInput
		case 'text':
			return TextInput
		case 'currency':
			return CurrencyField
		case 'section_header':
			return SectionHeader
		//   case 'eligibility_criteria_response': return EligibilityCriteriaAnswer;
		//   case 'investment_amount_response': return InvestmentAmountAnswer;
		default:
			return TextInput
	}
}

// eslint-disable-next-line arrow-body-style
export const getDocumentFieldsList = (values: FormValues, workflow: WorkFlow) =>
	Object.keys(values).filter(key =>
		workflow.cards.find(card =>
			card.schema.find(
				question =>
					key === question.id && question.type === 'file_upload',
			),
		),
	)

export const onFormUpdateError = (
	error: { [key: string]: string[] },
	setFieldError: (field: string, message?: string) => void,
) => {
	Object.entries(error).forEach(([field, errors]) => {
		if (Array.isArray(errors)) {
			const fieldError = errors.join(' ')
			setFieldError(field, fieldError)
		}
	})
}

export const parseNestedForms = (
	participantIds: number[] | null,
	statuses: FormStatusByParticipant,
) => {
	if (participantIds === null) return
	const hasErrors = participantIds.some(id => statuses[id]?.hasErrors)
	const anySubmitting = participantIds.some(id => statuses[id]?.isSubmitting)
	const anyDirty = participantIds.some(id => statuses[id]?.dirty)
	const anyValidating = participantIds.some(id => statuses[id]?.isValidating)
	const disallowSubmit =
		hasErrors || anySubmitting || anyDirty || anyValidating

	// eslint-disable-next-line consistent-return
	return { hasErrors, anyDirty, anySubmitting, anyValidating, disallowSubmit }
}

export const participantFormStatusReducer = (
	state: { statuses: FormStatusByParticipant; disallowSubmit: boolean },
	action: { newStatus: FormStatus; participantId: number },
) => {
	const { newStatus, participantId } = action
	if (!state.statuses[participantId]) {
		// eslint-disable-next-line no-param-reassign
		state.statuses[participantId] = BASE_FORM_STATUS
	}
	Object.assign(state.statuses[participantId], newStatus)
	// eslint-disable-next-line radix
	const participantIds = Object.keys(state.statuses).map(id => parseInt(id))
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const { disallowSubmit, anySubmitting, anyDirty } = parseNestedForms(
		participantIds,
		state.statuses,
	)!

	return { statuses: state.statuses, disallowSubmit, anySubmitting, anyDirty }
}
