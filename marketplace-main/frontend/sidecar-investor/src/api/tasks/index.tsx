import axios from "axios";
import {getSubmitChangesForTask} from "./routes";

class TasksAPI {
  submitChangesForTask = async (taskId: number) => {
    const url = getSubmitChangesForTask(taskId)
    const response = await axios.patch(url);
    return response.data
  };

}

export default new TasksAPI()