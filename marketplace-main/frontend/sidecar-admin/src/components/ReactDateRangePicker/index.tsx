import { get } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "@material-ui/icons/CalendarToday";
import { DatePickerCont, InputContainer } from "./styles";
import useOnClickOutside from "../../utils/useClickOutside";

export const formattedDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

export interface IRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface ReactDateRangePickerProps {
  range: IRange;
  setDateRange: (range: IRange) => void;
  saveWithButton?: boolean;
  customButton?: any
}

export const defaultDateRange:IRange={startDate: null, endDate:null}

const ReactDateRangePicker: React.FC<ReactDateRangePickerProps> = ({
  range,
  setDateRange,
  saveWithButton,
  customButton
}) => {
  const [internalState, setInternalState] = useState<IRange>(range || defaultDateRange);
  const [isOpen, setIsOpen] = useState(false);

  const ref = useRef(null);

  const handleClickOutside = () => {
   setIsOpen(false);
  };

  useOnClickOutside(ref, handleClickOutside);

  const handleSetRange = () => {
    setDateRange(internalState);
    setIsOpen(false);
  };

  const handleOpenCalendar = () => {
    setIsOpen(!isOpen);
  };

  const handleReset = () => {
    setInternalState({ startDate: null, endDate: null });
    if(!saveWithButton) setDateRange({ startDate: null, endDate: null })
  };

  const handleChange = (dates: [Date | null, Date | null]) => {
    const [startDate, endDate] = dates;
    setInternalState({ startDate, endDate });
    if(startDate && endDate && !saveWithButton) setDateRange({ startDate, endDate })
  };

  const divClick = (e: any) => e.stopPropagation();

  useEffect(() => {
    setInternalState(range || defaultDateRange);
  }, [range]);
  
  return (
    <div onClick={divClick}>
      {customButton ? <div onClick={handleOpenCalendar} className="cursor-pointer">{customButton}</div>:
      <InputContainer onClick={handleOpenCalendar}>
        <CalendarIcon />
        <input
          type="text"
          value={
            get(internalState, "startDate") && get(internalState, "endDate")
              ? `${formattedDate(
                  get(internalState, "startDate") as Date
                )} to ${formattedDate(get(internalState, "endDate") as Date)}`
              : "Select date range"
          }
          readOnly
        />
      </InputContainer>}
      <div ref={ref} >
        {isOpen && (
          <DatePickerCont>
            <DatePicker
              selected={get(internalState, "startDate")}
              onChange={handleChange}
              startDate={get(internalState, "startDate")}
              endDate={get(internalState, "endDate")}
              selectsRange
              inline
            />
            {saveWithButton && (
              <button onClick={handleSetRange}>Set Range</button>
            )}
            <button onClick={handleReset}>Reset</button>
          </DatePickerCont>
        )}
      </div>
    </div>
  );
};

export default ReactDateRangePicker;

