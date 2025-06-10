import moment from "moment";

export const dateFormatter = (dt: string) => {
  if (!dt) return dt;
  return moment(dt).format('MMM DD, YYYY')
}

export const standardizeDate = (dt: string) => {
  if (!dt) return dt;
  return moment.parseZone(dt).format('MM/DD/YYYY')
}

export const standardizeDateForApi = (dt: string) => {
  if (!dt) return dt;
  return moment.parseZone(dt).format('YYYY-MM-DD')
}

export const formatDateTime = (dt: string) => {
  if (!dt) return dt;
  return moment(dt).format('MMM DD, HH:mm')
}

export const getMonthYear = (dt: string) => {
  if (!dt) return dt;
  return moment(dt).format('MMM DD')
}

export const calculateNextDate = (startDate:string, daysToAdd:number) => {
  const startDateObj = new Date(startDate);
  const nextDateObj = new Date(startDateObj);
  nextDateObj.setDate(startDateObj.getDate() + daysToAdd);
  return nextDateObj.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
}

export const calculateDateDiffInDays = (startDate:string, endDate:string) => {
  const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
  const start:any = new Date(startDate);
  const end:any = new Date(endDate);
  
  const diffInMilliseconds = (end - start);
  const diffInDays = Math.floor(diffInMilliseconds / oneDay);
  
  return diffInDays;
}

export const generateDateWithOffset=(dateString:string)=>{

  const date = new Date(dateString);
  const time = date.getTime();
  const offset = date.getTimezoneOffset() * 1000 * 60;

  return new Date(time + offset)
}

const mdyToYmd=(dateStr:string)=> {
  // Split the input date string into components
  try {
    const [month, day, year] = dateStr.split('/');

  // Create a new date string in YYYY-MM-DD format
  const convertedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

  return convertedDate;
  } catch (error) {
    return dateStr
  }
  
}

export const generateDateTimeWithZeroTime =(dateString:string)=>new Date(mdyToYmd(dateString)+'T00:00:00.000Z');
