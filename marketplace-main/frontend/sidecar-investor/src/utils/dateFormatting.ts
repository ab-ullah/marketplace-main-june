import moment from "moment";
import { IRange } from "../components/ReactDateRangePicker";
import { format } from 'date-fns';

export const dateFormatter = (dt: string) => {
  if (!dt) return dt;
  return moment(dt).format('DD MMM YYYY')
}

export const standardizeDate = (dt: string) => {
  if (!dt) return dt;
  return moment(dt).format('MM/DD/YYYY')
}


export const monthFirstDateFormat = (dt: string) => {
  if (!dt) return dt;
  return moment(dt).format('MMMM DD, YYYY')
}

export const getDateFromString = (dt: string) => {
  if (!dt) return null;
  try {
    return moment(dt).toDate()
  } catch (e) {
    return null
  }
}

export const getDateFromStringForSorting = (dt: string | null) => {
  if (!dt) return moment(0);
  try {
    return moment(dt).toDate()
  } catch (e) {
    return moment(0)
  }
}

export const parseNativeDate = (dt: Date) => {
  return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`
}

export const generateDateParamsFromRange = (range: IRange)=>{
  let dateParams = ""
  if(range.startDate && range.endDate){
    dateParams = `?start_date=${format(
      range.startDate || 0,
      "yyyy-MM-dd"
    )}&end_date=${format(range.endDate || 0, "yyyy-MM-dd")}`;
  }

  return dateParams
}