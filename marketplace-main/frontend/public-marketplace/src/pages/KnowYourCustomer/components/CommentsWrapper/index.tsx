import React, { FunctionComponent } from 'react'
import { Comment } from '../../interfaces'
import { CommentContainer, CommentBadge, CommentSupport } from './styles'
import { COMMENT_RESOLVED } from '../../../../constants/commentStatus'
import { COMMENT_STATUSES } from './constants'

interface CommentProps {
	comment: Comment | null
}

const CommentWrapper: FunctionComponent<CommentProps> = ({ comment }) => {
	if (comment && comment.status === COMMENT_RESOLVED) return null
	const status = comment && COMMENT_STATUSES[comment.status]

	return (
		<CommentContainer status={status} className="comment-wrapper">
			<CommentBadge status={status}>
				{status && status.label}
			</CommentBadge>
			<div>{comment && comment.text}</div>
			<CommentSupport>
				Questions about this request? Contact{' '}
				<a href='mailto:EmployeeCoInvest@lasalle.com'>
					EmployeeCoInvest@lasalle.com
				</a>
			</CommentSupport>
		</CommentContainer>
	)
}

export default CommentWrapper
