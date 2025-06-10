import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import { format } from "date-fns";

interface IReactDatePickerCompProps {
  selected: Date | null | undefined;
  onChange: any;
  disabled?: boolean;
  name?: string;
  placeholderText?: string
  onBlur?: any;
  minDate?: any
}
const dateFormat="MM/dd/yyyy"
const ReactDatePickerComp = ({selected,onChange,disabled,name,placeholderText, onBlur, minDate}:IReactDatePickerCompProps) => {
  
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(
    null
  );

  useEffect(() => {
    setInternalSelectedDate(selected as Date);
  }, [selected]);

  const handleDateChange = (date: Date | null) => {
    setInternalSelectedDate(date);

    if (date) {
      const formattedDate = format(date,dateFormat as string)
      onChange(formattedDate)
    }
  };
  
  return (
    <ReactDatePicker
      selected={internalSelectedDate}
      onChange={handleDateChange}
      placeholderText={placeholderText}
      dateFormat={"MM/dd/yyyy"}
      name={name}
      dateFormatCalendar={"LLLL"}
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={30}
      // onKeyDown={(e) => {
      //   e.preventDefault();
      // }}
      todayButton={<Button variant="primary-outline">Today</Button>}
      onBlur={onBlur}
      minDate={minDate}
      disabled={Boolean(disabled)}
      className={
        Boolean(disabled)
          ? "disabled-react-datepicker"
          : ""
      }
    />
  );
};

export default ReactDatePickerComp;
