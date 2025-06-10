import { IEligibilityCriteriaDetail } from './criteria'
import { IEligibilityCriteriaResponse } from './criteriaResponse'

export interface IEligibilityData {
	criteria_preview?: IEligibilityCriteriaDetail
	user_response?: IEligibilityCriteriaResponse
}

export type PageTypeKeys =
	| 'jobsInfo'
	| 'finalStep'
	| 'willReview'
	| 'radioButtonBlock'
	| 'checkboxBlock'
	| 'userDocsBlock'
	| 'approvalCheckboxesBlock'
	| 'keyInvestmentInformationBlock'
	| 'dummy'
	| 'loader'
