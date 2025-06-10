import {parseJSON, format} from 'date-fns'

export const formatDate = (dateStr: string) => {
  return format(parseJSON(new Date(dateStr)), 'MMM dd')
}

export const requestAllocationDate = (startDate: string | null, endDate: string | null) => {
  if (!startDate && !endDate) return ''
  if (startDate && endDate) return `${formatDate(startDate)} - ${formatDate(endDate)}`
  if (endDate) return `upto ${formatDate(endDate)}`
  if (startDate) return `after ${formatDate(startDate)}`
}
