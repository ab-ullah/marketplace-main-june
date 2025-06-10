const API_BASE = process.env.REACT_APP_API_URL
const SOCKET_BASE = process.env.REACT_APP_WS_URL

export const WORKFLOW_PAGE_URL = `${API_BASE}/api/workflows`
export const TASKS_URL = `${WORKFLOW_PAGE_URL}/tasks`
export const TASK_FILTERS_URL = `${WORKFLOW_PAGE_URL}/tasks/filters`
export const TASK_COUNT = `${TASKS_URL}/recent-count`
export const taskReviewersUrl = (workflowId: number) => `${WORKFLOW_PAGE_URL}/${workflowId}/review-tasks`
export const revisedChangesUrl = (workflowId: number) => `${WORKFLOW_PAGE_URL}/${workflowId}/revised-changes`
export const workFlowCommentsUrl = (workflowId: number) => `${WORKFLOW_PAGE_URL}/${workflowId}/comments`
export const getWorkFlowCommentsUrl = (workflowId: number, token: string) => `${SOCKET_BASE}/workflows/${workflowId}/comments?token=${token}`

export const taskUpdateUrl = (taskId: number | string) => `${TASKS_URL}/${taskId}`
export const createGPSigningTaskURL = () => `${TASKS_URL}/sg-signing-task`
