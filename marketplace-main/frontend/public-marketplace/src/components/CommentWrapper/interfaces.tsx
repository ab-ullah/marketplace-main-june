export interface CommentStatus {
  backgroundColor: string
  badgeColor: string,
  code: string,
  label: string,
}

export interface CommentStatusesById {
  [id: number]: CommentStatus
}