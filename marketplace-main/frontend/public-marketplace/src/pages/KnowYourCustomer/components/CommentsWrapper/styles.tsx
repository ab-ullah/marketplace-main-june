/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import styled from 'styled-components'

export const CommentContainer = styled(({ status, ...props }) => (
	<div {...props} />
))`
	background-color: ${({ status }) => status?.backgroundColor};
	border-radius: 8px;
	cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
	display: flex;
	flex-direction: column;
	min-height: 67px;
	margin-top: 4px;
	margin-bottom: 4px;
	padding: 8px;
	transition: all 0.3s ease;
	width: 100%;
	white-space: pre-line;
`

export const CommentBadge = styled(({ status, ...props }) => (
	<div {...props} />
))`
	background-color: ${({ status }) => status?.badgeColor};
	border-radius: 27px;
	color: white;
	font-family: 'Quicksand Medium';
	padding: 4px 10px;
	transition: all 0.3s ease;
	user-select: none;
	width: fit-content;
`

export const CommentSupport = styled(({ status, ...props }) => (
	<div {...props} />
))`
	margin-top: 16px;
	font-family: 'Quicksand Bold';
`
