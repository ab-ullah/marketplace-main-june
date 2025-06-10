import React, {FunctionComponent, useState} from 'react'
import {parseJSON, format, isValid} from 'date-fns'

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";


interface DatePickerProps {
  onChange: (date: any) => void,
  startDate?: string | null;
  placeholder?: string
  value?: Date | null;
}
type AdditionalDatePickerProps = Omit<
  React.ComponentProps<typeof DatePicker>,
  keyof DatePickerProps
>;


const DatePickerComponent: FunctionComponent<DatePickerProps & AdditionalDatePickerProps> = ({onChange, startDate,placeholder, value,...props}) => {
  const [selectedDate, setSelectedDate] = useState<any>(startDate ? new Date(startDate) : undefined)

  const setStartDate = (date: any) => {
    setSelectedDate(date)
    const formattedDate = parseJSON(date)
    if(isValid(formattedDate)){
    onChange(format(formattedDate, 'yyyy-MM-dd'));}
  }

  return (
    <DatePicker placeholderText={placeholder} selected={value || selectedDate} onChange={(date) => setStartDate(date)} {...props}/>
  )
}

export default DatePickerComponent;