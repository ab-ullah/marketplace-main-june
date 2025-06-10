import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { Button, Col, Row } from "react-bootstrap";
import styled from "styled-components";

interface DateTimePickerProps {
  startDate?: Date | null;
  onDateChange: any;
  datePickerProps?: Record<string,any>;
  label?: string;
  dateFormat?: string;
}

const LabelCol = styled(Col)`
  line-height: 21px;
  font-size: 15px !important;
  font-weight: 700 !important;
  padding-bottom: 6px;
`;

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  startDate,
  onDateChange,
  datePickerProps,
  label,
  dateFormat
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
      const formattedDate = format(date,dateFormat as string)
      onDateChange(formattedDate)
    }
    else {
      onDateChange(date)
    }
  };

  return (
    <Row className={"mt-2"}>
      {label && (
        <LabelCol md={12} className="field-label">
          {label}
        </LabelCol>
      )}
      <Col md={12}>
        <DatePicker
          selected={internalSelectedDate}
          onChange={handleDateChange}
          showTimeSelect
          timeIntervals={15}
          dateFormat={dateFormat}
          todayButton={<Button variant="primary-outline">Today</Button>}
          {...datePickerProps}
        />
      </Col>
    </Row>
  );
};

DateTimePicker.defaultProps={
  dateFormat: "yyyy-MM-dd HH:mm"
}

export default DateTimePicker;
