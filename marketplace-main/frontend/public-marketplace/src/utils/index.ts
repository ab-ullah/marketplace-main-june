import { IApplicationStatus } from 'interfaces/application'
import moment from 'moment'

export const getDateFromString = (dt: string) => {
	if (!dt) return null
	try {
		return moment(dt).toDate()
	} catch (e) {
		return null
	}
}

export const canMovePastReviewDocs = (applicationStatus: IApplicationStatus) =>
	applicationStatus?.can_view_agreements
