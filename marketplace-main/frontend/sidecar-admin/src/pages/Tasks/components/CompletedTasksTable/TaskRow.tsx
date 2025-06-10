import React, {FunctionComponent} from 'react';
import {Badge} from "react-bootstrap";
import {ITask} from "../../../../interfaces/Workflow/task";
import {APPROVED} from "../../../../constants/taskStatus";
import {getTaskUrl} from "../../utils";
import {useHistory} from "react-router-dom";
import API from "../../../../api/backendApi";
import { dateFormatter } from '../../../../utils/dateFormatting';

interface TaskRowProps {
  task: ITask
  setIsLoading: (args0: boolean) => void
}


const TaskRow: FunctionComponent<TaskRowProps> = ({task, setIsLoading}) => {
  const {host, protocol} = window.location
  const history = useHistory()

  const getSigningUrl = async () => {
    if (!task.document_signing_info || task.completed) return null;
    setIsLoading(true)
    const {envelope_id, document_type, fund_external_id} = task.document_signing_info;
    const return_url = encodeURIComponent(
        `${protocol}//${host}/admin/tasks?envelope_id=${envelope_id}&document_type=${document_type}&fund_external_id=${fund_external_id}`
    );
    let response;
    if (document_type === 'agreement') {
      response = await API.getAgreementsSigningUrl(envelope_id, return_url);
    } else if (document_type === 'company_document') {
      response = await API.getCompanyDocumentSigningUrl(fund_external_id, envelope_id, return_url);
    }
    setIsLoading(true)
    window.open(response.signing_url, "_self");
  }

  const onTaskClick = (e: any) => {
    e.preventDefault()
    if (task.module === 'GP Signing' && task.document_signing_info) getSigningUrl()
    else history.push(getTaskUrl(task))
  }


  return <tr className="task-row clickable"
             onClick={onTaskClick} >
    <td>{dateFormatter(task.created_at)}</td>
    <td>{task.investor_name}</td>
    <td>{task.description}</td>
    <td>{task.fund_name}</td>
    <td>{task.module}</td>
    <td>{task.task_type_name}</td>
    <td><Badge bg={task.status === APPROVED ? 'success' : 'danger'}>{task.status_name}</Badge></td>
    <td>{task.responsible}</td>
  </tr>
};

export default TaskRow;
