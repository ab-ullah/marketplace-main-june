/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/require-default-props */
import { FunctionComponent, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IApplicationStatus } from '../../interfaces/application'
import Confirmation from './Confirmation'
import {
	useGetApplicationStatusQuery,
	useUpdateModulePositionMutation,
} from '../../api/rtkQuery/fundsApi'
import { canMovePastReviewDocs } from '../../utils'

interface IConfirmation {
	redirectUrl: string
	moduleId?: number
	customText?: string | null
}

const ConfirmationSection: FunctionComponent<IConfirmation> = ({
	moduleId,
	redirectUrl,
	customText,
}) => {
	// @ts-ignore
	const { externalId, company } = useParams<{ externalId: string, company: string }>()
	const { data: applicationStatus } = useGetApplicationStatusQuery<{
		data: IApplicationStatus
	}>(externalId)
	const [updateConfirmPosition] = useUpdateModulePositionMutation()
	const history = useNavigate()

	const showNext = canMovePastReviewDocs(applicationStatus)

	useEffect(() => {
		if (moduleId)
			updateConfirmPosition({ moduleId, externalId, currentStep: 1 })
	}, [])

	return (
		<Confirmation
			showNext={showNext}
			handleClickNext={() => history('/'+company+redirectUrl)}
			customText={customText}
		/>
	)
}

export default ConfirmationSection
