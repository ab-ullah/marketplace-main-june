import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatISO } from "date-fns";
import { Button } from "react-bootstrap";

interface DateTimePickerProps {
  startDate?: Date | null;
  onDateChange: any;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  startDate,
  onDateChange,
}) => {
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(
    null
  );

  useEffect(() => {
    setInternalSelectedDate(startDate as Date);
  }, [startDate]);

  const handleDateChange = (date: Date | null) => {
    setInternalSelectedDate(date);

    if (date) {
      const isoDate = formatISO(date);
      onDateChange(isoDate);
    }
    else{
      onDateChange(date)
    }
  };

  return (
    <DatePicker
      selected={internalSelectedDate}
      onChange={handleDateChange}
      showTimeSelect
      timeIntervals={15}
      dateFormat="yyyy-MM-dd HH:mm"
      todayButton={<Button variant="primary-outline">Today</Button>}
    />
  );
};

export default DateTimePicker;