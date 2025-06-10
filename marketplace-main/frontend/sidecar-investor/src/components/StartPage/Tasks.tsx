import {FunctionComponent} from "react";
import map from "lodash/map";
import get from "lodash/get";
import size from "lodash/size";
import CalendarIcon from "@material-ui/icons/CalendarToday";
import {Link, useHistory, useParams} from "react-router-dom";
import {H3, TasksContainer, TaskHeading, TaskWrapper, Pill} from "./styles";
import {monthFirstDateFormat} from "../../utils/dateFormatting";
import {ELIGIBILITY} from "../../constants/workflowModules";
import {useAppDispatch} from "../../app/hooks";
import {setCurrentTaskId} from "../../pages/KnowYourCustomer/kycSlice";
import { useCompanyPrefix } from "../../utils/hooks";

interface ITask {
  id: number;
  fund_name: string;
  due_date: string;
  name: string;
  fund_slug: string;
  fund_external_id: string;
  workflow_module: number;
}

interface TasksProps {
  tasks: ITask[];
}

const TasksSection: FunctionComponent<TasksProps> = ({tasks}) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const {companyPrefix} =useCompanyPrefix()
  
  const getTaskUrl = (task: ITask) => {
    return `${companyPrefix}/investor/funds/${task.fund_external_id}/application`
  }

  const handleTaskSelect = async (task: ITask) => {
    await dispatch(setCurrentTaskId(task.id))
    history.push(getTaskUrl(task))
  }

  return (
    <>
      <TaskHeading className="mb-3">
        <H3>{size(tasks) || 0} tasks</H3>
        <Link to="#">All tasks</Link>
      </TaskHeading>
      <TasksContainer>
        {map(tasks, (val, key) => {
          return (
            <TaskWrapper key={key} onClick={() => handleTaskSelect(val)}>
              <div className="info-wrapper">
                {val.due_date && <p className="task-time">
                  <CalendarIcon/>
                  {monthFirstDateFormat(get(val, 'due_date'))}
                </p>}
              </div>
              <p>{get(val, 'name')}</p>
            </TaskWrapper>
          );
        })}
      </TasksContainer>
    </>
  );
};

export default TasksSection;
