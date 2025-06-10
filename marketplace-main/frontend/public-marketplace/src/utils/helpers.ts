import { chunk, map } from "lodash";

/* eslint-disable import/prefer-default-export */
const deepCopy = (obj: object) => JSON.parse(JSON.stringify(obj))
const isNumStr = (strNum: string) => /^\d+.?\d*$/.test(strNum)

const stringToHex = (str: string): string =>
  map(str, (char) => char.charCodeAt(0).toString(16)).join('');

const hexToString = (hex: string): string =>
  map(chunk(hex, 2), (pair) => String.fromCharCode(parseInt(pair.join(''), 16))).join('');

const advisorSelectedHexParam=() => localStorage.getItem('advisor_selected')? `&advisor_selected_hex=${stringToHex(
		localStorage.getItem('advisor_selected') || '{}' 
	)}` :""

  const getAdvisorSelectedFromLocal =()=>JSON.parse(localStorage.getItem('advisor_selected') || "{}" )

  const getAdvisorSelectedFirstName = ()=>{
    const displayName = getAdvisorSelectedFromLocal()?.label as string
      return displayName? displayName.split("-")[0].split(" ")[0] :""

  }  

export { deepCopy, isNumStr, stringToHex, hexToString, advisorSelectedHexParam, getAdvisorSelectedFromLocal, getAdvisorSelectedFirstName }
