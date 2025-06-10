import {reduce} from "lodash";
import {createDecimal} from "./decimal";

export const getSumByProperty = (array: any[], attr: string) => {
    return reduce((array||[]), (acc: any, obj: any) =>  createDecimal(obj[attr] || 0).plus(acc), createDecimal(0)).toString();
};