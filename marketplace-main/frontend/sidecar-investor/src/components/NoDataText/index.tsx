import {FunctionComponent} from "react";
import {NO_DATA_TEXT_DIV} from "./styles";

interface INoDataText {
  text: string;
}


const NoDataText: FunctionComponent<INoDataText> = ({text}) => {
  return <NO_DATA_TEXT_DIV className={'mb-5'}>
    {text}
  </NO_DATA_TEXT_DIV>
};

export default NoDataText;