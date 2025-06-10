import { Cont } from "./styles";
import DateTimePicker from "../../../../components/DateTimePicker";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "../../../../utils/cookiesUtils";

export const AS_OF_DATE= 'AS-OF-DATE'

const VestingTool = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [newDate, setNewDate] = useState("");
  const storedDate = getCookie(AS_OF_DATE);

  const handleUpdateDate = () => {
    if (newDate) {
        setCookie(AS_OF_DATE, newDate,8)
        axios.defaults.headers.common[AS_OF_DATE]= newDate
    }
    else {
      deleteCookie(AS_OF_DATE);
      delete axios.defaults.headers.common[AS_OF_DATE]
    }
     setStartDate(newDate? new Date(newDate): null);
  };

  const handleChange = (d: string) => {
    setNewDate(d);
  };
  useEffect(() => {
    if (storedDate) {
      setStartDate(new Date(storedDate));
      setNewDate(storedDate);
    }
  }, []);

  const isDisabled =  newDate === storedDate || (!newDate && !storedDate);

  return (
    <Cont>
      <h1>Vesting tool </h1>
      {!startDate &&  <p>Current date will be used as not date is selected</p>}
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <div style={{width:'350px'}}>
        <DateTimePicker startDate={startDate} onDateChange={handleChange} dateFormat="yyyy-MM-dd'T'HH:mm:ss"/>
        </div>
        <Button
          disabled={isDisabled}
          onClick={handleUpdateDate}
          variant="primary"
        >
          Update Date
        </Button>
      </div>
    </Cont>
  );
};

export default VestingTool;
