import axios from "axios";
import {
  revisedChangesUrl,
  TASK_COUNT,
  taskReviewersUrl,
  TASKS_URL,
  taskUpdateUrl,
  workFlowCommentsUrl,
  createGPSigningTaskURL,
  TASK_FILTERS_URL
} from "./routes";

class WorkflowAPI {
  getTaskReviewers = async (workFlowId: number) => {
    const url = taskReviewersUrl(workFlowId)
    const response = await axios.get(url);
    return response.data
  };

  createTaskReviewers = async (workFlowId: number, payload: any) => {
    const url = taskReviewersUrl(workFlowId)
    const response = await axios.post(url, payload);
    return response.data
  };

  getTasks = async (qs: string | null) => {
    const url = `${TASKS_URL}?${qs}`
    const response = await axios.get(url);
    return response.data
  };

  getTaskFilters = async () => {
    const response = await axios.get(TASK_FILTERS_URL);
    return response.data
  };

  getTasksNextPage = async (url?: string | null) => {
    const response = await axios.get(url ? url : TASKS_URL);
    return response.data;
  };

  getTasksCount = async () => {
    const response = await axios.get(TASK_COUNT);
    return response.data
  };

  deleteTask = async (taskId: number) => {
    const url = taskUpdateUrl(taskId)
    const response = await axios.delete(url);
    return response.data
  };

  updateTask = async (taskId: number, payload: any) => {
    const url = taskUpdateUrl(taskId)
    const response = await axios.patch(url, payload);
    return response.data
  };

  getTaskDetail = async (taskId: number | string) => {
    const url = taskUpdateUrl(taskId)
    const response = await axios.get(url);
    return response.data
  };

  createComment = async (workFlowId: number, payload: any) => {
    const url = workFlowCommentsUrl(workFlowId)
    const response = await axios.post(url, payload);
    return response.data
  }

  revisedChanges = async (workFlowId: number) => {
    const url = revisedChangesUrl(workFlowId)
    const response = await axios.patch(url);
    return response.data
  }

  getWorkflowComments = async (workFlowId: number) => {
    const url = workFlowCommentsUrl(workFlowId)
    const response = await axios.get(url);
    return response.data
  }

  createGPSigningTask = async (payload: {application_id: number}) => {
    const url = createGPSigningTaskURL()
    const response = await axios.post(url, payload)
    return response.data
  }
}

export default new WorkflowAPI();
