import React, {FunctionComponent, useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectNotificationFilters, selectNotifications} from "../../selectors";
import {fetchNotificationFilters, fetchNotifications, fetchNotificationsNextPage} from "../../thunks";

import NotificationRow from "./NotificationRow";
import {NotificationsTable} from "../../../../presentational/StyledTableContainer";
import InfiniteScroll from "react-infinite-scroll-component";
import TableHeaderFilter from "./TableHeaderFilter";
import SideCarDateRangePicker from "../../../../components/DateRangePicker";
import {Range} from "react-date-range";
import Table from "react-bootstrap/Table";
import {NotificationTableHeadingWrapper} from "../../styles";
import {resetNotifications} from "../../investorOwnershipSlice";
import {ArrowDownward, ArrowUpward} from '@material-ui/icons';


interface NotificationsListProps {
  viewFundId?: number;
  viewInvestorId?: number;
  hideDueDate?: boolean;
}


const formatDate = (date: Date | undefined) => {
  if (!date) return '';
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}


const NotificationsList: FunctionComponent<NotificationsListProps> = ({viewFundId, viewInvestorId, hideDueDate}) => {
  const [selectedFunds, setSelectedFunds] = useState<number[]>([])
  const [selectedTypes, setSelectedTypes] = useState<number[]>([])
  const [publishedDateSortOrder, setPublishDateSortOrder] = useState<string>('desc')
  const [selectedInvestors, setSelectedInvestors] = useState<number[]>([])
  const [documentDateRange, setDocumentDateRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: new Date(""),
      key: 'selection'
    }
  ]);
  const [createdAtRange, setCreatedAtRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: new Date(""),
      key: 'selection'
    }
  ]);
  const [dueDateRange, setDueDateRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: new Date(""),
      key: 'selection'
    }
  ]);
  const {notifications, next} = useAppSelector(selectNotifications);
  const {type_options, fund_options, investor_options} = useAppSelector(selectNotificationFilters);
  const dispatch = useAppDispatch();

  const filterQueryString = () => {
    const qsArgs = [];
    if (viewFundId) qsArgs.push(`fund_id=${viewFundId}`)
    if (viewInvestorId) qsArgs.push(`investor_id=${viewInvestorId}`)
    if (qsArgs.length > 0) return qsArgs.join('&')
    return null
  }

  useEffect(() => {
    if (!viewFundId) {
      dispatch(fetchNotifications(null));
    }
    const filtersQs = filterQueryString()
    dispatch(fetchNotificationFilters(filtersQs));

    return () => {
      dispatch(resetNotifications({}))
    }
  }, [])

  useEffect(() => {
    const dueDate = dueDateRange[0];
    const documentDate = documentDateRange[0]
    const createdDate = createdAtRange[0]
    const hasDueDate = dueDate.startDate && dueDate.endDate;
    const hasDocumentDate = documentDate.startDate && documentDate.endDate;
    const hasCreatedDate = createdDate.startDate && createdDate.endDate;
    const isDescendingSort = publishedDateSortOrder === 'desc'
    console.log({publishedDateSortOrder})
    if (!hasDocumentDate && !hasCreatedDate && !hasDueDate && selectedTypes.length === 0 && selectedFunds.length === 0 && selectedInvestors.length === 0 && !viewFundId && !publishedDateSortOrder && isDescendingSort) {
      dispatch(fetchNotifications(null));
    } else {
      const qsArgs = [];
      if (selectedFunds.length > 0 || viewFundId) {
        if (viewFundId) qsArgs.push(`fund_id=${viewFundId}`)
        else qsArgs.push(`fund_id=${selectedFunds.join(',')}`)
      }
      if (selectedTypes.length > 0) qsArgs.push(`type=${selectedTypes.join(',')}`)
      if (selectedInvestors.length > 0 || viewInvestorId) {
        if (viewInvestorId) qsArgs.push(`investor_id=${viewInvestorId}`)
        else qsArgs.push(`investor_id=${selectedInvestors.join(',')}`)
      }
      if (hasDocumentDate) {
        qsArgs.push(`document_date__gte=${formatDate(documentDate.startDate)}`)
        qsArgs.push(`document_date__lte=${formatDate(documentDate.endDate)}`)
      }
      if (hasCreatedDate) {
        qsArgs.push(`created_at__gte=${formatDate(createdDate.startDate)}`)
        qsArgs.push(`created_at__lte=${formatDate(createdDate.endDate)}`)
      }
      if (hasDueDate) {
        qsArgs.push(`due_date__gte=${formatDate(dueDate.startDate)}`)
        qsArgs.push(`due_date__lte=${formatDate(dueDate.endDate)}`)
      }
      const ordering = isDescendingSort ? '-created_at' : 'created_at';
      qsArgs.push(`ordering=${ordering}`)
      dispatch(fetchNotifications(qsArgs.join('&')));
    }
  }, [selectedFunds, selectedTypes, selectedInvestors, dueDateRange, documentDateRange, viewInvestorId, viewFundId, createdAtRange, publishedDateSortOrder])

  const requestNextPage = () => {
    dispatch(fetchNotificationsNextPage(next));
  }

  return <NotificationsTable className="notifications-table">
    <InfiniteScroll
      dataLength={notifications.length}
      next={requestNextPage}
      hasMore={Boolean(next)}
      loader={<div>Loading...</div>}
      height={'495px'}
    >
      <Table id={'notificationsTable'}>
        <thead>
        <tr>
          <th></th>
          <th>
            <NotificationTableHeadingWrapper>
              <SideCarDateRangePicker
                heading={'Published Date'}
                value={createdAtRange}
                setValue={setCreatedAtRange}
              />
              {
                publishedDateSortOrder === 'desc' ? <ArrowDownward
                    onClick={() => setPublishDateSortOrder('asc')}
                    fontSize={"small"}
                    className={'cursor-pointer'}
                  />
                  : <ArrowUpward
                    onClick={() => setPublishDateSortOrder('desc')}
                    fontSize={"small"}
                    className={'cursor-pointer'}
                  />
              }
            </NotificationTableHeadingWrapper>
          </th>
          <th>
            <TableHeaderFilter
              title={'Type'}
              options={type_options}
              selectedValues={selectedTypes}
              setValues={setSelectedTypes}
            />
          </th>
          <th>
            <TableHeaderFilter
              title={'Investment'}
              options={fund_options}
              selectedValues={selectedFunds}
              setValues={setSelectedFunds}
            />
          </th>
          {!hideDueDate && <th>
            <SideCarDateRangePicker
              heading={'Due Date'}
              value={dueDateRange}
              setValue={setDueDateRange}
            />
          </th>}
          <th>Details</th>
        </tr>
        </thead>
        <tbody>
        {notifications.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} hideDueDate={hideDueDate}/>
        ))}
        </tbody>
      </Table>
    </InfiniteScroll>
  </NotificationsTable>
};

export default NotificationsList;
