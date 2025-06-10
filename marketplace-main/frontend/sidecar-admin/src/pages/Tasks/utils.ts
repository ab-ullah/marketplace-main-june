import {ITask} from "../../interfaces/Workflow/task";
import {ADMIN_URL_PREFIX} from "../../constants/routes";
import {REVIEW_REQUEST} from "../../constants/taskTypes";
import { PLAN_ID_PARAM } from "../CarryManagement/constants";

export const getTaskUrl = (task: ITask) => {
  let moduleLink = `/${ADMIN_URL_PREFIX}/tasks/${task.id}/review?fund_external_id=${task.fund_external_id}`
  if(task.task_type === REVIEW_REQUEST && task.module==="Carry Plan"){
    moduleLink = `/${ADMIN_URL_PREFIX}/tasks/${task.id}/review?${PLAN_ID_PARAM}=${task.carry_plan_id}`
  }
  if (task.task_type !== REVIEW_REQUEST && task.is_module_creator) {
    moduleLink = `/${ADMIN_URL_PREFIX}/eligibility/${task.module_id}/edit`
  }
  return moduleLink;
}