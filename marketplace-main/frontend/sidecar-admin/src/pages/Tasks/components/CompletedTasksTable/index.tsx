import React, {FunctionComponent, useEffect, useState} from 'react';
import {EligibilityTable} from "../../../../presentational/EligibilityTable";
import TaskRow from "./TaskRow";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {fetchTaskFilters, fetchTasks, fetchTasksNextPage} from "../../thunks";
import InfiniteScroll from "react-infinite-scroll-component";
import {selectAllTasks, selectTaskFilters} from "../../selectors";

import {ButtonAndSearchContainer, FilterBox, InputBox} from "../../../Funds/styles";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";

import TableHeaderFilter from "../../../../components/Table/TableHeaderFilter";


interface TasksTableProps {
  setIsLoading: (args0: boolean) => void
}

const TasksTable: FunctionComponent<TasksTableProps> = ({setIsLoading}) => {

  const [selectedFunds, setSelectedFunds] = useState<(number|string)[]>([])
  const [selectedModules, setSelectedModules] = useState<(number|string)[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<(number|string)[]>([1,3])  // pending and changes requested as default
  const [filterValue, setFilterValue] = useState("")

  const {tasks, next} = useAppSelector(selectAllTasks);
  const {module_options, fund_options, status_options} = useAppSelector(selectTaskFilters);
  const dispatch = useAppDispatch();
  

  useEffect(() => {
    dispatch(fetchTaskFilters());
  }, [])

  function dispatchFilteredTasks() {
    if (selectedModules.length === 0 && selectedFunds.length === 0 && selectedStatuses.length === 0 && filterValue == "") {
      dispatch(fetchTasks(null));
    } else {
      const qsArgs = [];
      if (selectedFunds.length > 0) qsArgs.push(`fund_id=${selectedFunds.join(',')}`)
      if (selectedStatuses.length > 0) qsArgs.push(`status=${selectedStatuses.join(',')}`)
      if (selectedModules.length > 0) qsArgs.push(`module=${selectedModules.join(',')}`)
      if (filterValue.length > 4) qsArgs.push(`investor=${filterValue}`)
      dispatch(fetchTasks(qsArgs.join('&')));
    }
  }
  
  useEffect(() => {
    dispatchFilteredTasks();
  }, [selectedFunds, selectedModules, selectedStatuses])
  
  useEffect(() => {
    if (selectedModules.length === 0 && selectedFunds.length === 0 && selectedStatuses.length === 0 && filterValue == "") {
      dispatch(fetchTasks(null));
    } else {
      const qsArgs = [];
      if (selectedFunds.length > 0) qsArgs.push(`fund_id=${selectedFunds.join(',')}`)
      if (selectedStatuses.length > 0) qsArgs.push(`status=${selectedStatuses.join(',')}`)
      if (selectedModules.length > 0) qsArgs.push(`module=${selectedModules.join(',')}`)
      if (filterValue.length > 4){
        qsArgs.push(`investor=${filterValue}`)
        dispatch(fetchTasks(qsArgs.join('&')));
      }
    }
  }, [filterValue])
  
  const requestNextPage = () => {
    dispatch(fetchTasksNextPage(next));
  }

  return <div className='task-container'>
    <div className="contained">
      <ButtonAndSearchContainer>
        <FilterBox>
          <InputBox
              type="text"
              placeholder="Search"
              value={filterValue}
              onChange={(e: any) => setFilterValue(e.target.value)}
          />
          <SearchOutlinedIcon />
        </FilterBox>
      </ButtonAndSearchContainer>
    </div>
    <div className='table-container table-striped'>
      <InfiniteScroll
          dataLength={tasks.length}
          next={requestNextPage}
          hasMore={Boolean(next)}
          loader={<div>Loading...</div>}
      >
        <EligibilityTable hover borderless responsive>
          <thead>
          <tr>
            <th>Date</th>
            <th>Investor Name</th>
            <th>Description</th>
            <th>
              <TableHeaderFilter
                  title={'Fund'}
                  options={fund_options}
                  selectedValues={selectedFunds}
                  setValues={setSelectedFunds}
              />
            </th>
            <th>
              <TableHeaderFilter
                  title={'Module'}
                  options={module_options}
                  selectedValues={selectedModules}
                  setValues={setSelectedModules}
              />
            </th>
            <th>Type</th>
            <th>
              <TableHeaderFilter
                  title={'Status'}
                  options={status_options}
                  selectedValues={selectedStatuses}
                  setValues={setSelectedStatuses}
              />
            </th>
            <th>Responsible</th>
          </tr>
          </thead>
          <tbody>
          {tasks.map((task) => <TaskRow key={`table-task-${task.id}`} task={task} setIsLoading={setIsLoading}/>)}
          </tbody>
        </EligibilityTable>
      </InfiniteScroll>
    </div>
  </div>
};

export default TasksTable;
