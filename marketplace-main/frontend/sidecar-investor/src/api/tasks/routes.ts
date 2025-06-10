const API_BASE = process.env.REACT_APP_API_URL

export const WORKFLOW_TASKS_URL = `${API_BASE}/api/workflows`
export const getSubmitChangesForTask = (taskId: number) => `${WORKFLOW_TASKS_URL}/tasks/${taskId}/submit-changes`

