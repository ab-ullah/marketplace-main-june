import { NO_DATA_TEXT_DIV } from "pages/HomePage/styled";
import {FunctionComponent} from "react";

interface INoDataText {
  text: string;
}


const NoDataMessage: FunctionComponent<INoDataText> = ({text}) => {
  return <NO_DATA_TEXT_DIV>
    {text}
  </NO_DATA_TEXT_DIV>
};

export default NoDataMessage;